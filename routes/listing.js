const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');

const { listingSchema } = require('../schema.js');

const Listing = require('../models/listing.js');
const listingController = require('../controllers/listings.js');
const { isLoggedIn } = require('../middleware.js');


// ================= DEFAULT IMAGE =================

const DEFAULT_LISTING_IMAGE = '/images/listing-placeholder.svg';


// ================= NORMALIZE IMAGE =================

const normalizeListingImage = (listing) => {

    const imageUrl = listing.image?.url?.trim();

    return {

        ...listing,

        image: {

            ...listing.image,

            url: imageUrl || DEFAULT_LISTING_IMAGE

        }

    };

};

const isOwner = wrapAsync(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new ExpressError(404, 'Listing not found');
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        throw new ExpressError(404, 'Listing not found');
    }

    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash('error', 'Only the listing owner can edit or delete this listing.');
        return res.redirect(`/listings/${listing._id}`);
    }

    res.locals.listing = listing;
    next();
});



// ================= VALIDATION =================

const validateListing = (req, res, next) => {

    const { error, value } =
        listingSchema.validate(
            req.body,
            {
                abortEarly: false,
                convert: true
            }
        );


    if (error) {

        throw new ExpressError(
            400,
            error.message
        );

    }


    req.body = value;

    next();

};


// ================= INDEX, CREATE ROUTES =================
router
    .route('/').get(wrapAsync(listingController.index))
    .post(
    isLoggedIn,
    validateListing,
    wrapAsync(listingController.createListing)
);

// ================= NEW ROUTE =================
// GET /listings/new

router.get(
    '/new',
    isLoggedIn,
    wrapAsync(listingController.renderNewForm)
);

// ================= SHOW, UPDATE, DELETE ROUTES =================
router
    .route('/:id')
    .get(wrapAsync(listingController.showListing))
    .put( isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing))
    .delete( isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// ================= EDIT ROUTE =================
// GET /listings/:id/edit

router.get(
    '/:id/edit',
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);


module.exports = router;
