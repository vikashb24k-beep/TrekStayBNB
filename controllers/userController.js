const User = require('../models/user.js');

module.exports.renderSignup = (req, res) => {
    res.render('users/signup');
};

module.exports.signup = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        const registeredUser = await User.register(new User({ username, email }), password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);

            const redirectUrl = res.locals.redirectUrl || '/listings';
            delete req.session.returnTo;
            req.flash('success', 'Welcome to TrekStayBNB! Your account is ready.');
            res.redirect(redirectUrl);
        });
    } catch (err) {
        if (err.name === 'UserExistsError') {
            req.flash('error', `${username} is already taken. Please choose another username.`);
            return res.redirect('/signup');
        }
        next(err);
    }
};

module.exports.renderSignin = (req, res) => {
    res.render('users/login');
};

module.exports.signin = (req, res) => {
    const redirectUrl = res.locals.redirectUrl || '/listings';
    delete req.session.returnTo;
    req.flash('success', 'You have successfully logged in.');
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'You have successfully logged out.');
        res.redirect('/listings');
    });
};

module.exports.profile = (req, res) => {
    res.render('users/profile', { user: req.user });
};
