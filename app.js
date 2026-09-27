const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const Listing = require('./models/listing.js');
const { title } = require('process');
const data = require("./init/data.js");


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

// ================= ROUTES =================

app.get('/', (req, res) => {
    res.send('Welcome to Airbnb Clone! , i am root');
});

// app.get("/testListing", async(req,res)=>{
//     let sampleListing = new Listing({
//         title : "my new villa",
//         description : "by the beach",
//         price : 1200,
//         location : "Goa",
//         country : "India",
//     });

//     await sampleListing.save().then((result)=>{
//         console.log(result);
//     }).catch((e)=>{
//         console.log(e);
//     });
//     res.send("res tested")
// });

// index route
app.get('/listings', async (req, res) => {
    try {
        const allListings = await Listing.find({});

        console.log(allListings);

        res.render('listings/index.ejs', {
            allListings,
        });
    } catch (err) {
        console.log(err);

        res.status(500).send('Error fetching listings');
    }
});

// show route --> Read

app.get("/listings/:id", async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render('listings/show', { listing });
});

//new route

app.get("/listings/new",(req,res)=>{
    
})













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
