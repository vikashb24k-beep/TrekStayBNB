const express = require('express');
const router = express.Router();

const listingController = require('../controllers/listingController.js');
const { isLoggedIn } = require('../middleware/auth.js');
const { isOwner } = require('../middleware/ownership.js');
const validate = require('../middleware/validation.js');
const { uploadListingImage } = require('../middleware/upload.js');
const listingSchema = require('../schemas/listingSchema.js');
const wrapAsync = require('../utils/wrapAsync.js');

router.route('/')
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        uploadListingImage,
        validate(listingSchema),
        wrapAsync(listingController.createListing)
    );

router.get('/new', isLoggedIn, listingController.renderNewForm);

router.route('/:id')
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        uploadListingImage,
        validate(listingSchema),
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

router.get('/:id/edit', isLoggedIn, isOwner, listingController.renderEditForm);

module.exports = router;
