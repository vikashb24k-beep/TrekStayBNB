const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');

const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const ExpressError = require('./utils/ExpressError.js');

const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');

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

// ================= LISTING ROUTES =================

app.use('/listings', listings);

// ================= REVIEW ROUTES =================

app.use('/listings/:id/reviews', reviews);

// ================= 404 ERROR =================

app.use((req, res, next) => {
    next(new ExpressError(404, 'Page not found'));
});

// ================= ERROR HANDLING =================

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;

    res.status(statusCode).render('error.ejs', {
        message,
    });
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
