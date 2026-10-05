module.exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();

    if (req.params.id) {
        req.session.returnTo = `/listings/${req.params.id}`;
    } else if (req.baseUrl === '/listings' && req.method !== 'GET') {
        req.session.returnTo = '/listings/new';
    } else {
        req.session.returnTo = req.originalUrl;
    }

    req.flash('error', 'Please log in to continue.');
    res.redirect('/login');
};

module.exports.saveRedirectUrl = (req, res, next) => {
    const returnTo = req.session?.returnTo;
    if (typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
        res.locals.redirectUrl = returnTo;
    }
    next();
};
