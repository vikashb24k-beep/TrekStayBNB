require('dotenv').config();

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');

const connectDB = require('./config/db.js');
const createSessionMiddleware = require('./config/session.js');
const passport = require('./config/passport.js');
const { saveRedirectUrl } = require('./middleware/auth.js');
const { notFound, handleError } = require('./middleware/errorHandler.js');
const listingRoutes = require('./routes/listingRoutes.js');
const reviewRoutes = require('./routes/reviewRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(createSessionMiddleware());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(saveRedirectUrl);

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

// app.get('/', (req, res) => res.redirect('/listings'));
app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.use(notFound);
app.use(handleError);

async function start() {
    await connectDB();
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

if (require.main === module) {
    start().catch(() => {
        console.error('Application startup failed. Check the database and server configuration.');
        process.exitCode = 1;
    });
}

module.exports = app;
