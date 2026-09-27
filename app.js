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

// ================= MIDDLEWARE =================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================

app.get('/', (req, res) => {
    res.send('Welcome to Airbnb Clone! , i am root');
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
