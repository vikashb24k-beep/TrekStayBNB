const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const ExpressError = require('../utils/ExpressError.js');

const DEFAULT_LISTING_IMAGE = '/images/listing-placeholder.svg';

const normalizeListingImage = (listing) => ({
    ...listing,
    image: {
        ...(listing.image || {}),
        url: listing.image?.url?.trim() || DEFAULT_LISTING_IMAGE,
    },
});

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
};

module.exports.renderNewForm = (req, res) => res.render('listings/new.ejs');

module.exports.createListing = async (req, res) => {
    const newListing = new Listing(normalizeListingImage(req.body.listing));
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash('success', 'New listing created successfully!');
    res.redirect('/listings');
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new ExpressError(404, 'Listing not found');

    const listing = await Listing.findById(id)
        .populate({ path: 'reviews', populate: { path: 'author' } })
        .populate('owner');
    if (!listing) throw new ExpressError(404, 'Listing not found');
    res.render('listings/show.ejs', {
        listing,
        mapboxToken: process.env.MAPBOX_ACCESS_TOKEN || '',
    });
};

module.exports.renderEditForm = (req, res) => {
    res.render('listings/edit.ejs', { listing: res.locals.listing });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(
        id,
        normalizeListingImage(req.body.listing),
        { new: true, runValidators: true }
    );
    if (!updatedListing) throw new ExpressError(404, 'Listing not found');
    req.flash('success', 'Listing updated successfully!');
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) throw new ExpressError(404, 'Listing not found');
    req.flash('success', 'Listing deleted successfully!');
    res.redirect('/listings');
};
