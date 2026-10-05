const accessToken = process.env.MAPBOX_ACCESS_TOKEN || '';

module.exports = {
    accessToken,
    publicToken: process.env.MAPBOX_PUBLIC_TOKEN || (
        accessToken.startsWith('pk.') ? accessToken : ''
    ),
};
