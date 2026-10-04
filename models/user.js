const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose').default;


// ================= USER SCHEMA =================

const userSchema = new Schema({

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    }

});


// ================= PASSPORT PLUGIN =================

userSchema.plugin(passportLocalMongoose);


// ================= USER MODEL =================

const User = mongoose.model('User', userSchema);


module.exports = User;
