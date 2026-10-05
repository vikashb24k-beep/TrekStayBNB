const Joi = require('joi');

module.exports = Joi.object({
    review: Joi.object({
        comment: Joi.string().trim().required(),
        rating: Joi.number().required().min(1).max(5),
    }).required(),
});
