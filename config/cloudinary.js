const cloudinary = require('cloudinary').v2;

const requiredVariables = ['C_NAME', 'C_API_KEY', 'C_SECRET'];
const missingVariables = requiredVariables.filter((key) => !process.env[key]);
if (missingVariables.length) {
    throw new Error(`Missing Cloudinary configuration: ${missingVariables.join(', ')}`);
}

cloudinary.config({
    cloud_name: process.env.C_NAME,
    api_key: process.env.C_API_KEY,
    api_secret: process.env.C_SECRET,
});

module.exports = { cloudinary };
