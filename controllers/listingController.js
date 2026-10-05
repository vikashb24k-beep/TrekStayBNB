const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const ExpressError = require('../utils/ExpressError.js');
const geocodeLocation = require('../utils/geocode.js');
const { publicToken } = require('../config/mapbox.js');

const DEFAULT_LISTING_IMAGE = '/images/listing-placeholder.svg';

const normalizeListingImage = (listing) => ({
    ...listing,
    image: {
        ...(listing.image || {}),
        url: listing.image?.url?.trim() || DEFAULT_LISTING_IMAGE,
    },
});

module.exports.index = async (req, res) => {
    const categories = ['Trending', 'Rooms', 'Iconic Cities', 'Mountains', 'Castles', 'Amazing Pools', 'Farms', 'Arctic'];
    const selectedCategory = categories.includes(req.query.category) ? req.query.category : '';
    const searchTerm = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const filters = [];

    if (selectedCategory) filters.push({ category: selectedCategory });
    if (searchTerm) {
        const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(escapedSearch, 'i');
        filters.push({
            $or: [
                { title: searchRegex },
                { location: searchRegex },
                { country: searchRegex },
            ],
        });
    }

    const allListings = await Listing.find(filters.length ? { $and: filters } : {});
    res.render('listings/index.ejs', { allListings, categories, selectedCategory, searchTerm });
};

module.exports.renderNewForm = (req, res) => res.render('listings/new.ejs', { categories: ['Trending', 'Rooms', 'Iconic Cities', 'Mountains', 'Castles', 'Amazing Pools', 'Farms', 'Arctic'] });

module.exports.createListing = async (req, res) => {
    const newListing = new Listing(normalizeListingImage(req.body.listing));
    newListing.geometry = {
        type: 'Point',
        coordinates: await geocodeLocation(newListing.location, newListing.country),
    };
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
        mapboxToken: publicToken,
    });
};

module.exports.renderEditForm = (req, res) => {
    res.render('listings/edit.ejs', { listing: res.locals.listing, categories: ['Trending', 'Rooms', 'Iconic Cities', 'Mountains', 'Castles', 'Amazing Pools', 'Farms', 'Arctic'] });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, 'Listing not found');

    const updatedData = normalizeListingImage(req.body.listing);
    const locationChanged =
        listing.location !== updatedData.location ||
        listing.country !== updatedData.country;

    Object.assign(listing, updatedData);
    if (locationChanged || !listing.geometry?.coordinates?.length) {
        listing.geometry = {
            type: 'Point',
            coordinates: await geocodeLocation(listing.location, listing.country),
        };
    }
    await listing.save();
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
