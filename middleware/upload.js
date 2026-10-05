const multer = require('multer');
const { storage } = require('../config/cloudinary.js');
const ExpressError = require('../utils/ExpressError.js');

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return callback(new ExpressError(400, 'Upload a JPG, PNG, GIF, or WebP image (maximum 5 MB).'));
        }
        callback(null, true);
    },
});

module.exports.uploadListingImage = (req, res, next) => {
    upload.single('listing[image]')(req, res, (error) => {
        if (error) {
            const message = error.code === 'LIMIT_FILE_SIZE'
                ? 'Image must be 5 MB or smaller.'
                : error.message;
            return next(new ExpressError(error.statusCode || 400, message));
        }

        if (req.file) {
            req.body.listing = req.body.listing || {};
            req.body.listing.image = {
                filename: req.file.filename || req.file.originalname,
                url: req.file.path,
            };
        }
        next();
    });
};
