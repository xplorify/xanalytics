"use strict"

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongoosePaginate = require('mongoose-paginate'),
    bcrypt = require('bcryptjs');

var userSchema = new Schema({
    first: { type: String, required: 'FirstNameInvalid' },
    last: { type: String, required: 'LastNameInvalid' },
    email: { type: String, lowercase: true, required: 'EmailInvalid' },
    username: { type: String, unique: true, required: 'UsernameInvalid' },
    password: { type: String, select: false, required: 'PasswordInvalid' }
});

// userSchema.plugin(mongoosePaginate);

userSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(password, done) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
};

module.exports = userSchema;