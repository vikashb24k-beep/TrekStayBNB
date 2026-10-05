const mongoose = require('mongoose');
const Review = require('./review.js');

const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        required: true,
        trim: true,
    },

    image: {
       url: String,
       filename: String
    },

    price: {
        type: Number,
        required: true,
        min: 0,
    },

    location: {
        type: String,
        required: true,
        trim: true,
    },

    country: {
        type: String,
        required: true,
        trim: true,
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            default: undefined,
            validate: {
                validator: (coordinates) =>
                    Array.isArray(coordinates) &&
                    coordinates.length === 2 &&
                    coordinates[0] >= -180 && coordinates[0] <= 180 &&
                    coordinates[1] >= -90 && coordinates[1] <= 90,
                message: 'Coordinates must be [longitude, latitude].',
            },
        },
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    category: {
        type: String,
        enum: ['Trending', 'Rooms', 'Iconic Cities', 'Mountains', 'Castles', 'Amazing Pools', 'Farms', 'Arctic'],
        default: 'Trending',
    }
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
