const express = require('express');
const passport = require('../config/passport.js');
const router = express.Router();

const userController = require('../controllers/userController.js');
const { isLoggedIn } = require('../middleware/auth.js');
const validate = require('../middleware/validation.js');
const userSchema = require('../schemas/userSchema.js');
const wrapAsync = require('../utils/wrapAsync.js');

router.get('/signup', userController.renderSignup);
router.post(
    '/signup',
    validate(userSchema, { redirectOnError: '/signup' }),
    wrapAsync(userController.signup)
);
router.get('/login', userController.renderSignin);
router.post(
    '/login',
    (req, res, next) => {
        if (typeof req.body.username === 'string') req.body.username = req.body.username.trim();
        next();
    },
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
    userController.signin
);
router.post('/logout', isLoggedIn, userController.logout);
router.get('/profile', isLoggedIn, userController.profile);

module.exports = router;
