const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');

const { listingSchema } = require('../schema.js');

const Listing = require('../models/listing.js');
const listingController = require('../controllers/listings.js');
const { isLoggedIn } = require('../middleware.js');
const multer = require('multer');
const { storage } = require('../cloudconfig.js');

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return callback(new ExpressError(400, 'Upload a JPG, PNG, GIF, or WebP image (maximum 5 MB).'));
        }
        callback(null, true);
    },
});

const uploadListingImage = (req, res, next) => {
    upload.single('listing[image]')(req, res, (err) => {
        if (err) {
            const message = err.code === 'LIMIT_FILE_SIZE'
                ? 'Image must be 5 MB or smaller.'
                : err.message;
            return next(new ExpressError(400, message));
        }

        if (req.file) {
            req.body.listing = req.body.listing || {};
            req.body.listing.image = {
                filename: req.file.filename || req.file.originalname,
                url: req.file.path,
            };
        }

        next();
    });
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
    .route('/')
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, uploadListingImage, validateListing, wrapAsync(listingController.createListing));

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
