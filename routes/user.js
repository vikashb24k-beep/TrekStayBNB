const express = require('express');
const passport = require('passport');
const router = express.Router();
const { isLoggedIn } = require('../middleware.js');
const userController = require('../controllers/users.js');

router.get('/signup', userController.renderSignup);
router.post('/signup', userController.signup);
router.get('/login', userController.renderSignin);
router.post(
    '/login',
    (req, res, next) => {
        if (typeof req.body.username === 'string') req.body.username = req.body.username.trim();
        next();
    },
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login',
    }),
    userController.signin
);

router.post('/logout', (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You are not logged in.');
        return res.redirect('/listings');
    }

    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'You have successfully logged out.');
        res.redirect('/listings');
    });
});

router.get('/profile', isLoggedIn, userController.profile);

module.exports = router;
