const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const Listing = require('./models/listing.js');
const { title } = require('process');
const data = require("./init/data.js");
const methodOverride = require("method-override");

// ================= EXPRESS APP =================

const app = express();
const port = 8080;

// ================= EJS SETUP =================

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ================= MIDDLEWARE =================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ================= ROUTES =================

app.get('/', (req, res) => {
    res.send('Welcome to Airbnb Clone! , i am root');
});

// index route
app.get('/listings', async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render('listings/index.ejs', {
            allListings,
        });
    } catch (err) {
        console.log(err);

        res.status(500).send('Error fetching listings');
    }
});


//new route

app.get("/listings/new",(req,res)=>{
    res.render('listings/new.ejs');
})

// show route --> Read

app.get("/listings/:id", async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render('listings/show', { listing });
});

// create route

app.post("/listings",async (req,res)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
});

//edit route

app.get('/listings/:id/edit', async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    res.render('listings/edit.ejs', { listing });
});

//update route

app.put("/listings/:id", async (req,res)=>{
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
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
