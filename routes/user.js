const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const passport = require('passport');
const { isLoggedIn } = require('../middleware.js');
const { signupSchema } = require('../schema.js');

// ================= SIGNUP ROUTES =================

router.get('/signup', (req, res) => {
    res.render('users/signup');
});

router.post('/signup', async (req, res, next) => {
    const { error, value } = signupSchema.validate(req.body, {
        abortEarly: false,
        convert: true,
    });

    if (error) {
        req.flash(
            'error',
            error.details[0].message
        );

        return res.redirect('/signup');
    }

    const { username, email, password } = value;

    try {
        // Create new user
        const newUser = new User({
            username,
            email
        });

        // Register user
        // passport-local-mongoose automatically hashes the password
        const registeredUser = await User.register(
            newUser,
            password
        );

        // Automatically log in after signup
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }

            // Redirect user to original page
            const redirectUrl =
                res.locals.redirectUrl || '/listings';

            delete req.session.returnTo;

            req.flash(
                'success',
                'Welcome to TrekStayBNB! Your account is ready.'
            );

            res.redirect(redirectUrl);
        });

    } catch (err) {

        // Username already exists
        if (err.name === 'UserExistsError') {
            req.flash(
                'error',
                `${username} is already taken. Please choose another username.`
            );

            return res.redirect('/signup');
        }

        next(err);
    }
});


// ================= LOGIN ROUTES =================

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post(
    '/login',

    (req, res, next) => {
        if (typeof req.body.username === 'string') {
            req.body.username = req.body.username.trim();
        }
        next();
    },

    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login'
    }),

    (req, res) => {

        const redirectUrl =
            res.locals.redirectUrl || '/listings';

        delete req.session.returnTo;

        req.flash(
            'success',
            'You have successfully logged in.'
        );

        res.redirect(redirectUrl);
    }
);

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('users/profile', { user: req.user });
});


// ================= LOGOUT ROUTE =================

router.post('/logout', (req, res, next) => {

    if (!req.isAuthenticated()) {
        req.flash(
            'error',
            'You are not logged in.'
        );

        return res.redirect('/listings');
    }

    req.logout((err) => {

        if (err) {
            return next(err);
        }

        req.flash(
            'success',
            'You have successfully logged out.'
        );

        res.redirect('/listings');
    });
});


module.exports = router;
