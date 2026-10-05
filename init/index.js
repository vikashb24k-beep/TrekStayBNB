const mongoose = require('mongoose');
const initData = require('./data.js');
require('dotenv').config();
const connectDB = require('../config/db.js');
const Listing = require('../models/listing.js');

// ================= MONGODB CONNECTION =================

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
        await connectDB();

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
