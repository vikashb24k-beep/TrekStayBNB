const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    image: {
        filename: {
            type: String,
            default: 'listingimage',
        },

        url: {
            type: String,
            default:
                'https://media.istockphoto.com/id/509891863/photo/businessman-icon-profile-picture.webp?a=1&b=1&s=612x612&w=0&k=20&c=BrpRU7iBCJbnHQh8USmV9qkzOTCuop82uJ8O1rJx1t0=',
        },
    },

    price: {
        type: Number,
        required: true,
    },

    location: {
        type: String,
        required: true,
    },

    country: {
        type: String,
        required: true,
    },
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
