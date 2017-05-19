"use strict"

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongoosePaginate = require('mongoose-paginate'),
    bcrypt = require('bcryptjs');

var userSchema = new Schema({
    firstname: { type: String, required: 'FirstNameInvalid' },
    lastname: { type: String, required: 'LastNameInvalid' },
    email: { type: String, lowercase: true, required: 'EmailInvalid' },
    username: { type: String, unique: true, required: 'UsernameInvalid' },
    password: { type: String, required: 'PasswordInvalid' },
    roles: [{
        type: String,
        enum: ['admin', 'teacher', 'student'],
        default: 'admin'
    }]
}, {
    timestamps: true
});

// userSchema.plugin(mongoosePaginate);

userSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }
    var SALT_FACTOR = 10;
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(password, done) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) {
            console.log('Error during password comparison: ' + err);
            return done(err);
        }
        if (!isMatch) {
            console.log('Passwords don\'t match.');
        }
        done(err, isMatch);
    });
};

module.exports = userSchema;