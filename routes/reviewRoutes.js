const express = require('express');
const router = express.Router({ mergeParams: true });

const reviewController = require('../controllers/reviewController.js');
const { isLoggedIn } = require('../middleware/auth.js');
const { isReviewAuthor } = require('../middleware/ownership.js');
const validate = require('../middleware/validation.js');
const reviewSchema = require('../schemas/reviewSchema.js');
const wrapAsync = require('../utils/wrapAsync.js');

router.post('/', isLoggedIn, validate(reviewSchema), wrapAsync(reviewController.createReview));
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;
