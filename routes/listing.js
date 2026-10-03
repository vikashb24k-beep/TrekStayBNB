const express = require('express');
const router = express.Router();

const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');

const { listingSchema } = require('../schema.js');

const Listing = require('../models/listing.js');


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


// ================= LOGIN MIDDLEWARE =================

const requireLogin = (req, res, next) => {

    if (!req.isAuthenticated()) {

        // Save requested URL
        req.session.returnTo = req.originalUrl;

        req.flash(
            'error',
            'Please log in to create a listing.'
        );

        return res.redirect('/login');

    }

    next();

};


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


// ================= INDEX ROUTE =================
// GET /listings

router.get(
    '/',
    wrapAsync(async (req, res) => {

        const allListings =
            await Listing.find({});


        res.render(
            'listings/index.ejs',
            {
                allListings
            }
        );

    })
);


// ================= NEW ROUTE =================
// GET /listings/new

router.get(
    '/new',
    requireLogin,
    (req, res) => {

        res.render(
            'listings/new.ejs'
        );

    }
);


// ================= CREATE ROUTE =================
// POST /listings

router.post(
    '/',
    requireLogin,
    validateListing,

    wrapAsync(async (req, res) => {

        const newListing =
            new Listing(
                normalizeListingImage(
                    req.body.listing
                )
            );


        await newListing.save();


        req.flash(
            'success',
            'New listing created successfully!'
        );


        res.redirect('/listings');

    })
);


// ================= SHOW ROUTE =================
// GET /listings/:id

router.get(
    '/:id',

    wrapAsync(async (req, res) => {

        const { id } = req.params;


        const listing =
            await Listing
                .findById(id)
                .populate('reviews');


        if (!listing) {

            throw new ExpressError(
                404,
                'Listing not found'
            );

        }


        res.render(
            'listings/show.ejs',
            {
                listing
            }
        );

    })
);


// ================= EDIT ROUTE =================
// GET /listings/:id/edit

router.get(
    '/:id/edit',

    requireLogin,

    wrapAsync(async (req, res) => {

        const { id } = req.params;


        const listing =
            await Listing.findById(id);


        if (!listing) {

            throw new ExpressError(
                404,
                'Listing not found'
            );

        }


        res.render(
            'listings/edit.ejs',
            {
                listing
            }
        );

    })
);


// ================= UPDATE ROUTE =================
// PUT /listings/:id

router.put(
    '/:id',

    requireLogin,

    validateListing,

    wrapAsync(async (req, res) => {

        const { id } = req.params;


        const updatedListing =
            await Listing.findByIdAndUpdate(

                id,

                normalizeListingImage(
                    req.body.listing
                ),

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!updatedListing) {

            throw new ExpressError(
                404,
                'Listing not found'
            );

        }


        req.flash(
            'success',
            'Listing updated successfully!'
        );


        res.redirect(
            `/listings/${id}`
        );

    })
);


// ================= DELETE ROUTE =================
// DELETE /listings/:id

router.delete(
    '/:id',

    requireLogin,

    wrapAsync(async (req, res) => {

        const { id } = req.params;


        const deletedListing =
            await Listing.findByIdAndDelete(id);


        if (!deletedListing) {

            throw new ExpressError(
                404,
                'Listing not found'
            );

        }


        console.log(
            'Deleted listing:',
            deletedListing
        );


        req.flash(
            'success',
            'Listing deleted successfully!'
        );


        res.redirect(
            '/listings'
        );

    })
);


module.exports = router;
