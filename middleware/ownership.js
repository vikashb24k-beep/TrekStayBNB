const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const ExpressError = require('../utils/ExpressError.js');
const wrapAsync = require('../utils/wrapAsync.js');

module.exports.isOwner = wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new ExpressError(404, 'Listing not found');

    const listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, 'Listing not found');
    if (!listing.owner?.equals(req.user._id)) {
        req.flash('error', 'Only the listing owner can edit or delete this listing.');
        return res.redirect(`/listings/${listing._id}`);
    }

    res.locals.listing = listing;
    next();
});

module.exports.isReviewAuthor = wrapAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new ExpressError(404, 'Listing not found');
    if (!mongoose.isValidObjectId(reviewId)) throw new ExpressError(404, 'Review not found');

    const [listing, review] = await Promise.all([
        Listing.findById(id),
        Review.findById(reviewId),
    ]);
    if (!listing) throw new ExpressError(404, 'Listing not found');
    if (!review || !listing.reviews.some((entry) => entry.equals(reviewId))) {
        throw new ExpressError(404, 'Review not found');
    }
    if (!review.author?.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to perform this action.');
        return res.redirect(`/listings/${id}`);
    }

    next();
});
