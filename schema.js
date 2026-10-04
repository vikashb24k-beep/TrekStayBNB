const Joi = require('joi');

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        location: Joi.string().trim().required(),
        country: Joi.string().trim().required(),
        price: Joi.number().required().min(0),

        image: Joi.object({
            filename: Joi.string().allow('', null),
            url: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
        }).allow(null),
    }).required(),
});


const reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().trim().required(),
        rating: Joi.number().required().min(1).max(5),
    }).required(),
});

const signupSchema = Joi.object({
    username: Joi.string().trim().min(3).max(30).required(),
    email: Joi.string().trim().email().lowercase().required(),
    password: Joi.string().min(3).required(),
});

module.exports = { listingSchema, reviewSchema, signupSchema };
