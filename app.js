const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');

const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const ExpressError = require('./utils/ExpressError.js');

const listingRouter = require('./routes/listing.js');
const reviewRouter  = require('./routes/review.js');
const userRouter = require('./routes/user.js');
const { saveRedirectUrl } = require('./middleware.js');


// ================= SESSION =================

const session = require('express-session');


// ================= MONGO STORE =================

const MongoStore = require('connect-mongo').default;


// ================= FLASH =================

const flash = require('connect-flash');


// ================= PASSPORT =================

const passport = require('passport');
const LocalStrategy = require('passport-local');

const User = require('./models/user.js');


// ================= EXPRESS APP =================

const app = express();

const port = process.env.PORT || 8080;


// ================= EJS SETUP =================

app.set(
    'views',
    path.join(__dirname, 'views')
);

app.set(
    'view engine',
    'ejs'
);

app.engine(
    'ejs',
    ejsMate
);


// ================= MIDDLEWARE =================

app.use(
    express.static(
        path.join(__dirname, 'public')
    )
);

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    methodOverride('_method')
);


// ================= SESSION =================

const sessionOptions = {

    secret: process.env.SESSION_SECRET || 'development-only-session-secret',

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({

        mongoUrl: process.env.MONGO_URI

    }),

    cookie: {

        maxAge:
            7 *
            24 *
            60 *
            60 *
            1000,

        httpOnly: true,

        sameSite: 'lax',

        secure: process.env.NODE_ENV === 'production'

    }

};


app.use(
    session(sessionOptions)
);


// ================= FLASH =================

app.use(
    flash()
);


// ================= PASSPORT =================

app.use(
    passport.initialize()
);

app.use(
    passport.session()
);

app.use(saveRedirectUrl);


// ================= PASSPORT LOCAL STRATEGY =================

passport.use(
    new LocalStrategy(
        User.authenticate()
    )
);


// ================= SERIALIZE USER =================

passport.serializeUser(
    User.serializeUser()
);


// ================= DESERIALIZE USER =================

passport.deserializeUser(
    User.deserializeUser()
);


// ================= GLOBAL VARIABLES =================

app.use(
    (req, res, next) => {

        res.locals.success =
            req.flash('success');

        res.locals.error =
            req.flash('error');

        res.locals.currentUser =
            req.user;

        next();

    }
);


// ================= HOME ROUTE =================

app.get(
    '/',
    (req, res) => {

        res.redirect('/listings');

    }
);

// ================= LISTING ROUTES =================

app.use(
    '/listings',
    listingRouter
);


// ================= REVIEW ROUTES =================

app.use('/listings/:id/reviews', reviewRouter);

// ================= USER ROUTES =================

app.use(
    '/',
    userRouter
);

// ================= 404 ERROR =================

app.use(
    (req, res, next) => {

        next(
            new ExpressError(
                404,
                'Page not found'
            )
        );

    }
);


// ================= ERROR HANDLING =================

app.use(
    (err, req, res, next) => {

        if (res.headersSent) {
            return next(err);
        }

        const {

            statusCode = 500,

            message =
                'Something went wrong'

        } = err;


        res
            .status(statusCode)
            .render(
                'error.ejs',
                {
                    message
                }
            );

    }
);


// ================= MONGODB CONNECTION =================

async function main() {

    await mongoose.connect(
        process.env.MONGO_URI
    );

}


// ================= START SERVER =================

main()

    .then(() => {

        console.log(
            'MongoDB connected successfully!'
        );


        app.listen(
            port,
            () => {

                console.log(
                    `Server running on http://localhost:${port}`
                );

            }
        );

    })

    .catch((err) => {

        console.log(
            'MongoDB connection failed:'
        );

        console.log(
            err.message
        );

    });
