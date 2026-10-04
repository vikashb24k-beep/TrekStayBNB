const express = require('express');
const mongoose = require('mongoose');
const router = express.Router({ mergeParams: true });

const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');

const { reviewSchema } = require('../schema.js');

const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const { isLoggedIn } = require('../middleware.js');

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

router.post(
    '/',
    isLoggedIn,
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

        req.flash('success', 'Review added successfully!');

        res.redirect(`/listings/${id}`);
    })
);

// ================= DELETE REVIEW =================
// DELETE /listings/:id/reviews/:reviewId

router.delete(
    '/:reviewId',
    isLoggedIn,
    wrapAsync(async (req, res) => {
        const { id, reviewId } = req.params;

        if (!mongoose.isValidObjectId(reviewId)) {
            throw new ExpressError(404, 'Review not found');
        }

        const listing = await Listing.findById(id);

        if (!listing) {
            throw new ExpressError(404, 'Listing not found');
        }

        const reviewBelongsToListing = listing.reviews.some(
            (listingReviewId) => listingReviewId.equals(reviewId)
        );

        if (!reviewBelongsToListing) {
            throw new ExpressError(404, 'Review not found');
        }

        await Listing.findByIdAndUpdate(id, {
            $pull: {
                reviews: reviewId,
            },
        });

        await Review.findByIdAndDelete(reviewId);

        req.flash('success', 'Review deleted successfully!');
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;
