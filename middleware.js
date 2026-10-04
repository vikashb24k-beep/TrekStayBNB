const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const Review = require('./models/review.js');
const ExpressError = require('./utils/ExpressError.js');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (req.params.id) {
            req.session.returnTo = `/listings/${req.params.id}`;
        } else if (req.baseUrl === '/listings' && req.method !== 'GET') {
            req.session.returnTo = '/listings/new';
        } else {
            req.session.returnTo = req.originalUrl;
        }
        req.flash('error', 'Please log in to continue.');
        return res.redirect('/login');
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    const returnTo = req.session?.returnTo;
    if (typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
        res.locals.redirectUrl = returnTo;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new ExpressError(404, 'Listing not found');
    const listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, 'Listing not found');
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to perform this action.');
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
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
    if (!review.author || !review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to perform this action.');
        return res.redirect(`/listings/${id}`);
    }
    next();
};
