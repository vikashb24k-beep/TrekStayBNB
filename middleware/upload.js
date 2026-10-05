const multer = require('multer');
const { cloudinary } = require('../config/cloudinary.js');
const ExpressError = require('../utils/ExpressError.js');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return callback(new ExpressError(400, 'Upload a JPG, PNG, GIF, or WebP image (maximum 5 MB).'));
        }
        callback(null, true);
    },
});

const uploadToCloudinary = (file) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
        {
            folder: 'TrackStayBNB',
            allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
            resource_type: 'image',
        },
        (error, result) => {
            if (error) return reject(error);
            resolve(result);
        }
    );

    stream.on('error', reject);
    stream.end(file.buffer);
});

module.exports.uploadListingImage = (req, res, next) => {
    upload.single('listing[image]')(req, res, async (error) => {
        if (error) {
            const message = error.code === 'LIMIT_FILE_SIZE'
                ? 'Image must be 5 MB or smaller.'
                : error.message;
            return next(new ExpressError(error.statusCode || 400, message));
        }

        try {
            if (req.file) {
                const result = await uploadToCloudinary(req.file);
                req.body = req.body || {};
                req.body.listing = req.body.listing || {};
                req.body.listing.image = {
                    filename: result.public_id,
                    url: result.secure_url,
                };
            }
            next();
        } catch (uploadError) {
            next(new ExpressError(uploadError.http_code || 502, 'Image upload failed. Please try again.'));
        }
    });
};
