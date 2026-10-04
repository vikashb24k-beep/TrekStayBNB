class ExpressError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = 'ExpressError';
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;
