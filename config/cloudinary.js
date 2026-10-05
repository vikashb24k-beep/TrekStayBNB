const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

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

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'TrackStayBNB',
        allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    },
});

module.exports = { cloudinary, storage };
