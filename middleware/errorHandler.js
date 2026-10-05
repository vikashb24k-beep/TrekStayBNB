const ExpressError = require('../utils/ExpressError.js');

module.exports.notFound = (req, res, next) => {
    next(new ExpressError(404, 'Page not found'));
};

module.exports.handleError = (err, req, res, next) => {
    if (res.headersSent) return next(err);

    const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
    const message = statusCode >= 500 && process.env.NODE_ENV === 'production'
        ? 'Something went wrong. Please try again.'
        : (err.message || 'Something went wrong.');

    res.status(statusCode).render('error.ejs', { statusCode, message });
};
