const mongoose = require('mongoose');

module.exports = async function connectDB() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is not configured.');
    await mongoose.connect(mongoUri);
    return mongoose.connection;
};
