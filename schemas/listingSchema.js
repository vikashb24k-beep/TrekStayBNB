const Joi = require('joi');

module.exports = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        location: Joi.string().trim().max(256).required(),
        country: Joi.string().trim().max(256).required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            filename: Joi.string().allow('', null),
            url: Joi.alternatives().try(
                Joi.string().uri({ scheme: ['http', 'https'] }),
                Joi.string().pattern(/^\/uploads\/[a-zA-Z0-9._-]+$/)
            ).allow('', null),
        }).allow(null),
    }).required(),
});
