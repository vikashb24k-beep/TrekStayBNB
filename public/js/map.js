(() => {
    const mapElement = document.getElementById('listing-map');
    if (!mapElement) return;

    const status = document.getElementById('listing-map-status');
    const token = mapElement.dataset.mapToken?.trim();
    const location = mapElement.dataset.mapLocation?.trim();
    const savedCoordinates = mapElement.dataset.mapCoordinates
        ?.split(',')
        .map(Number);

    const showStatus = (message) => {
        if (status) status.textContent = message;
    };

    if (!token) {
        showStatus('Map unavailable. Add MAPBOX_ACCESS_TOKEN to the server environment.');
        return;
    }

    if (!window.mapboxgl) {
        showStatus('Mapbox could not be loaded. Check your internet connection and try again.');
        return;
    }

    mapboxgl.accessToken = token;

    const showMap = (coordinates) => {
        const map = new mapboxgl.Map({
            container: mapElement,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: coordinates,
            zoom: 11,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        new mapboxgl.Marker()
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup().setText(location || 'Listing location'))
            .addTo(map);

        showStatus(location || 'Listing location');
    };

    if (
        Array.isArray(savedCoordinates) &&
        savedCoordinates.length === 2 &&
        savedCoordinates.every(Number.isFinite)
    ) {
        showMap(savedCoordinates);
        return;
    }

    if (!location) {
        showStatus('Map unavailable because this listing has no location.');
        return;
    }

    // Older listings without saved coordinates are geocoded for display.
    const geocodingUrl = new URL('https://api.mapbox.com/search/geocode/v6/forward');
    geocodingUrl.searchParams.set('q', location);
    geocodingUrl.searchParams.set('limit', '1');
    geocodingUrl.searchParams.set('autocomplete', 'false');
    geocodingUrl.searchParams.set('access_token', token);

    fetch(geocodingUrl)
        .then((response) => {
            if (!response.ok) throw new Error(`Location lookup failed (${response.status})`);
            return response.json();
        })
        .then((result) => {
            const coordinates = result.features?.[0]?.geometry?.coordinates;
            if (
                !Array.isArray(coordinates) ||
                coordinates.length < 2 ||
                !coordinates.slice(0, 2).every(Number.isFinite)
            ) {
                throw new Error('Location not found');
            }
            showMap(coordinates.slice(0, 2));
        })
        .catch((error) => {
            console.error('Mapbox error:', error);
            showStatus('We could not find this listing location on the map.');
        });
})();
