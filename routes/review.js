const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { reviewSchema } = require('../schema.js');
const { isLoggedIn,isReviewAuthor } = require('../middleware.js');
const reviewController = require('../controllers/reviews.js');

// ================= VALIDATION =================


const validateReview = (req, res, next) => {
    const { error, value } = reviewSchema.validate(req.body, {
        abortEarly: false,
        convert: true,
    });

    if (error) {
        throw new ExpressError(400, error.message);
    }

    req.body = value;
    next();
};

// ================= CREATE REVIEW =================
// POST /listings/:id/reviews

router.post('/', isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// ================= DELETE REVIEW =================
// DELETE /listings/:id/reviews/:reviewId

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;
