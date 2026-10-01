const express = require('express');
const router = express.Router({ mergeParams: true });

const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');

const { reviewSchema } = require('../schema.js');

const Review = require('../models/review.js');
const Listing = require('../models/listing.js');

// ================= VALIDATION =================

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        throw new ExpressError(400, error.message);
    }

    next();
};

// ================= CREATE REVIEW =================
// POST /listings/:id/reviews

router.post(
    '/',
    validateReview,
    wrapAsync(async (req, res) => {
        const { id } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {
            throw new ExpressError(404, 'Listing not found');
        }

        const newReview = new Review(req.body.review);

        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        console.log('New review added:', newReview);

        res.redirect(`/listings/${id}`);
    })
);

// ================= DELETE REVIEW =================
// DELETE /listings/:id/reviews/:reviewId

router.delete(
    '/:reviewId',
    wrapAsync(async (req, res) => {
        const { id, reviewId } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {
            throw new ExpressError(404, 'Listing not found');
        }

        await Listing.findByIdAndUpdate(id, {
            $pull: {
                reviews: reviewId,
            },
        });

        await Review.findByIdAndDelete(reviewId);

        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;
