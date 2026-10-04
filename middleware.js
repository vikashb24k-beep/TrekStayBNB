const Listing = require('./models/listing.js');

// Require a logged-in user before protected listing and review actions.
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (req.params.id) {
            // After login, return to the listing (review actions are POST/DELETE).
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

    // Only allow local paths, never an external redirect from session data.
    if (typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
        res.locals.redirectUrl = returnTo;
    }

    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)) {
        req.flash('error', 'You do not have permission to perform this action.');
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash('error', 'You do not have permission to perform this action.');
        return res.redirect(`/listings/${id}`);
    }
    next();
};
