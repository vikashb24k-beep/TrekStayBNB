const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const { randomBytes } = require('crypto');

module.exports = function createSessionMiddleware() {
    const secret = process.env.SESSION_SECRET || (
        process.env.NODE_ENV === 'production'
            ? ''
            : randomBytes(32).toString('hex')
    );
    if (!secret) {
        throw new Error('SESSION_SECRET is not configured.');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not configured.');
    }

    return session({
        secret,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        },
    });
};
