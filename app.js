const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');

const Listing = require('./models/listing.js');
const Review = require('./models/review.js');

const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
// const { MessageEvent } = require('http');
const { listingSchema, reviewSchema } = require('./schema.js');


// ================= EXPRESS APP =================

const app = express();
const port = 8080;

// ================= EJS SETUP =================

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

// ================= MIDDLEWARE =================

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

// ================= HOME ROUTE =================

app.get('/', (req, res) => {
    res.send('home');
});

// ================= LISTINGS ROUTES =================

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        throw new ExpressError(400, error.message);
    }

    next();
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.message);
    }
    next();
};

// INDEX ROUTE
// GET /listings

app.get(
    '/listings',
    wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render('listings/index.ejs', {
            allListings,
        });
    })
);

// NEW ROUTE
// GET /listings/new

app.get('/listings/new', (req, res) => {
    res.render('listings/new.ejs');
});

// CREATE ROUTE
// POST /listings

app.post(
    '/listings',
    validateListing,
    wrapAsync(async (req, res) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();

        res.redirect('/listings');
    })
);
// SHOW ROUTE
// GET /listings/:id

app.get(
    '/listings/:id',
    wrapAsync(async (req, res) => {
        const { id } = req.params;
         const listing = await Listing.findById(id).populate('reviews');
        if (!listing) {
            throw new ExpressError(404, 'Listing not found');
        }
        res.render('listings/show.ejs', {
            listing,
        });
    })
);

// EDIT ROUTE
// GET /listings/:id/edit

app.get(
    '/listings/:id/edit',
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            throw new ExpressError(404, 'Listing not found');
        }

        res.render('listings/edit.ejs', {
            listing,
        });
    })
);

// UPDATE ROUTE
// PUT /listings/:id

app.put(
    '/listings/:id',
    validateListing,
    wrapAsync(async (req, res) => {
        const { id } = req.params;

        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { ...req.body.listing },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedListing) {
            throw new ExpressError(404, 'Listing not found');
        }

        res.redirect(`/listings/${id}`);
    })
);

// DELETE ROUTE
// DELETE /listings/:id

app.delete(
    '/listings/:id',
    wrapAsync(async (req, res) => {
        const { id } = req.params;

        const deletedListing = await Listing.findByIdAndDelete(id);

        if (!deletedListing) {
            throw new ExpressError(404, 'Listing not found');
        }

        console.log('Deleted listing:', deletedListing);

        res.redirect('/listings');
    })
);

// review route
// post

app.post("/listings/:id/reviews",validateReview,
    wrapAsync(async (req,res)=>{
    const {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        throw new ExpressError(404, 'Listing not found');
    }
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
     await newReview.save();
    await listing.save();

    console.log('New review added:', newReview);

    res.redirect(`/listings/${id}`);
}));


// Delete review route
app.delete("/listings/:Id/reviews/:reviewId",
    wrapAsync(async (req,res)=>{
        let {Id, reviewId} = req.params;
        await Listing.findByIdAndUpdate(Id, {$pull: {reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/listings/${Id}`);
    }));




// ================= 404 ERROR =================

app.use((req, res, next) => {
    next(new ExpressError(404, 'Page not found'));
});



// ================= ERROR HANDLING =================

// This MUST be the LAST middleware

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;

    res.status(statusCode).render('error.ejs', { message });

});
// ================= MONGODB CONNECTION =================

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
}

// ================= START SERVER =================

main()
    .then(() => {
        console.log('MongoDB connected successfully!');

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log('MongoDB connection failed:');
        console.log(err.message);
    });
