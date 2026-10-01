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
            default:
                'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9R_4LyKaJZnZrrU3hAb2GVAGswoSFlMfhe83cxZ6MOw9cCpSSLMhJCHxqgteiD06IJ3Rv4HyjmMYSLxFvn1LxkWv9RSPtUwWNjBeDrZTWby_0xl42iLEfHiHSeSCy1oVl-jUGiymQ=s1360-w1360-h1020-rw'
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
