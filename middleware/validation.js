const ExpressError = require('../utils/ExpressError.js');

module.exports = (schema, { redirectOnError } = {}) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        convert: true,
    });

    if (error) {
        const message = error.details.map((item) => item.message).join('; ');
        if (redirectOnError) {
            req.flash('error', message);
            return res.redirect(redirectOnError);
        }
        return next(new ExpressError(400, message));
    }
    req.body = value;
    next();
};
