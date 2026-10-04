const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const ExpressError = require('../utils/ExpressError.js');

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new ExpressError(404, 'Listing not found');
    const listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, 'Listing not found');

    const review = new Review({ ...req.body.review, author: req.user._id });
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash('success', 'Review added successfully!');
    res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new ExpressError(404, 'Listing not found');
    if (!mongoose.isValidObjectId(reviewId)) throw new ExpressError(404, 'Review not found');

    const listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, 'Listing not found');
    if (!listing.reviews.some((listingReviewId) => listingReviewId.equals(reviewId))) {
        throw new ExpressError(404, 'Review not found');
    }

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/listings/${id}`);
};
