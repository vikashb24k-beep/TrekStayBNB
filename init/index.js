const mongoose = require('mongoose');
const initData = require('./data.js');
require('dotenv').config({
    path: '../.env',
});

const Listing = require('../models/listing.js');

// ================= MONGODB CONNECTION =================

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
}

// ================= INITIALIZE DATABASE =================

const initDB = async () => {
    try {
        // Delete existing listings
        await Listing.deleteMany({});

        // Insert initial data
        await Listing.insertMany(initData.data);

        console.log('Data initialized successfully!');
    } catch (err) {
        console.log('Error initializing data:');
        console.log(err);
    }
};

// ================= START =================

async function start() {
    try {
        await main();

        console.log('MongoDB connected successfully!');

        await initDB();

        await mongoose.connection.close();

        console.log('Database connection closed.');
    } catch (err) {
        console.log('MongoDB connection failed:');
        console.log(err.message);
    }
}

start();
