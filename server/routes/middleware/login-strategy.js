"use strict";

var mongoose = require('mongoose'),
    config = require("../../config"),
    userSchema = require("../../models/user"),
    PassportLocalStrategy = require('passport-local').Strategy;

mongoose.Promise = require('bluebird');


module.exports = new PassportLocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    session: false,
    passReqToCallback: true
}, (req, username, password, done) => {
    const userData = {
        username: username.trim(),
        password: password.trim()
    };

    console.log('Trying to login user with credentials: ' + JSON.stringify(userData));
    var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
    var userModel = db.model("users", userSchema);

    // find a user by username
    return userModel
        .findOne({ username: userData.username })
        .exec((err, user) => {
            if (err) {
                return done(err);
            }
            if (!user) {
                const error = new Error('Incorrect username');
                error.name = 'IncorrectCredentialsError';

                return done(error);
            }
            console.log('Comparing passwords: \'' + user.password + '\' and \'' + userData.password + '\'');
            return user.comparePassword(userData.password, (passwordErr, isMatch) => {
                if (err) {
                    return done(err);
                }
                if (!isMatch) {
                    const error = new Error('Incorrect password');
                    error.name = 'IncorrectCredentialsError';
                    return done(error);
                }
                return done(null, user);
            });
        })
        .finally(function() {
            db.close();
        });
});