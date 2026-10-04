const mongoose = require('mongoose');
const path = require('path');
const initData = require('./data.js');
require('dotenv').config({
    path: path.join(__dirname, '..', '.env'),
});

const Listing = require('../models/listing.js');

// ================= MONGODB CONNECTION =================

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
}

// ================= INITIALIZE DATABASE =================

const initDB = async () => {
    // This initializer intentionally replaces the existing listing collection.
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "6ac185939de38aa0996a0cc7" }));

    // Insert initial data
    await Listing.insertMany(initData.data);


    console.log('Data initialized successfully!');
};

// ================= START =================

async function start() {
    try {
        await main();

        console.log('MongoDB connected successfully!');

        await initDB();
    } catch (err) {
        console.error('Database initialization failed:', err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

start();
