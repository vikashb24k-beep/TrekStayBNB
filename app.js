const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');


// ================= EXPRESS APP =================

const app = express();
const port = 8080;

// ================= EJS SETUP =================

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// ================= MIDDLEWARE =================

app.use(express.json());
app.use(express.urlencoded({extended : true}));


// ================= MONGODB CONNECTION =================

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
}
// ================= START SERVER =================

main()
    .then(() => {
        console.log('MongoDB connected successfully!');
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    }).catch((err) => {
        console.log('Error:');
        console.log(err.message);
    });


    //=== routes ================


    
