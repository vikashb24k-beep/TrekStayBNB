const ExpressError = require('./ExpressError.js');
const { accessToken } = require('../config/mapbox.js');

module.exports = async (location, country) => {
    const token = accessToken;
    if (!token) {
        throw new ExpressError(503, 'Listing geocoding is not configured on the server.');
    }

    const query = `${location}, ${country}`.trim();
    if (query.length > 256 || query.includes(';')) {
        throw new ExpressError(400, 'Enter a shorter location without semicolons.');
    }

    const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '1');
    url.searchParams.set('autocomplete', 'false');
    url.searchParams.set('permanent', 'true');
    url.searchParams.set('access_token', token);

    let response;
    try {
        response = await fetch(url);
    } catch {
        throw new ExpressError(502, 'Could not reach the location service. Please try again.');
    }

    if (!response.ok) {
        throw new ExpressError(502, 'The location service could not geocode this listing.');
    }

    let result;
    try {
        result = await response.json();
    } catch {
        throw new ExpressError(502, 'The location service returned an invalid response.');
    }

    const coordinates = result.features?.[0]?.geometry?.coordinates;
    if (
        !Array.isArray(coordinates) ||
        coordinates.length < 2 ||
        !coordinates.slice(0, 2).every(Number.isFinite) ||
        coordinates[0] < -180 || coordinates[0] > 180 ||
        coordinates[1] < -90 || coordinates[1] > 90
    ) {
        throw new ExpressError(422, 'Could not find coordinates for that location. Check the location and country.');
    }

    return coordinates.slice(0, 2);
};
