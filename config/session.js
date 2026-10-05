const session = require('express-session');
const { MongoStore } = require('connect-mongo');

module.exports = function createSessionMiddleware() {
    // Check MongoDB URI
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not configured.');
    }

    // Check session secret
    if (!process.env.SESSION_SECRET) {
        throw new Error('SESSION_SECRET is not configured.');
    }

    // Create MongoDB session store
    const store = MongoStore.create({
        mongoUrl: process.env.MONGO_URI,

        collectionName: 'sessions',

        // Session expires after 7 days
        ttl: 7 * 24 * 60 * 60,

        // Update session in MongoDB only once every 24 hours
        touchAfter: 24 * 60 * 60,
    });

    // Handle MongoDB session-store errors
    store.on('error', (error) => {
        console.error('Error in MongoDB session store:', error);
    });

    // Create Express session middleware
    return session({
        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        store: store,

        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        },
    });
};
