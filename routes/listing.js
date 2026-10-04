const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');

const { listingSchema } = require('../schema.js');

const Listing = require('../models/listing.js');
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
    isLoggedIn,
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
    isLoggedIn,
    validateListing,

    wrapAsync(async (req, res) => {

        const newListing =
            new Listing(
                normalizeListingImage(
                    req.body.listing
                )
            );

        newListing.owner = req.user._id;



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

        if (!mongoose.isValidObjectId(id)) {
            throw new ExpressError(404, 'Listing not found');
        }


        const listing =
            await Listing
                .findById(id)
                .populate('reviews')
                .populate('owner');


        if (!listing) {
            throw new ExpressError(404, 'Listing not found');
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

    isLoggedIn,
    isOwner,

    (req, res) => {
        res.render(
            'listings/edit.ejs',
            {
                listing: res.locals.listing
            }
        );
    }
);


// ================= UPDATE ROUTE =================
// PUT /listings/:id

router.put(
    '/:id',

    isLoggedIn,
    isOwner,

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

    isLoggedIn,
    isOwner,

    wrapAsync(async (req, res) => {

        const { id } = req.params;


        const deletedListing = await Listing.findByIdAndDelete(id);


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
