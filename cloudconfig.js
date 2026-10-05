const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
   cloud_name: process.env.C_NAME,
    api_key: process.env.C_API_KEY,
    api_secret: process.env.C_SECRET

});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'TrackStayBNB',
        allowed_formats: ['jpeg', 'png', 'gif', 'webp'],
        // transformation: [{ width: 800, height: 600, crop: 'limit' }],
    },
});

module.exports = {
    cloudinary,
    storage
};
