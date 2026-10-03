const mongoose = require('mongoose');
const Review = require('./review.js');

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
            default: '/images/listing-placeholder.svg',
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
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
});

// middleware to delete all reviews associated with a listing when the listing is deleted

listingSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        });
    }
});


const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
