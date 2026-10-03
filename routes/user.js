const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const passport = require('passport');

// ================= SIGNUP ROUTES =================

router.get('/signup', (req, res) => {
    res.render('users/signup');
});

router.post('/signup', async (req, res, next) => {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!username || !email || !password) {
        req.flash('error', 'Username, email, and password are required.');
        return res.redirect('/signup');
    }

    try {
        const registeredUser = await User.register(
            new User({ username, email }),
            password
        );

        await new Promise((resolve, reject) => {
            req.login(registeredUser, (err) => err ? reject(err) : resolve());
        });

        req.flash('success', 'Welcome to TrekStayBNB! Your account is ready.');
        res.redirect('/listings');
    } catch (err) {
        if (err.name === 'UserExistsError') {
            req.flash('error', `${username} That username is already taken. Please choose another.`);
            return res.redirect('/signup');
        }

        next(err);
    }
});

// ================= LOGIN ROUTES =================

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    const redirectUrl = req.session.returnTo || '/listings';
    delete req.session.returnTo;

    req.flash('success', 'You have successfully logged in.');
    res.redirect(redirectUrl);
});

module.exports = router;
