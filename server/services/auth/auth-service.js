"use strict";

var mongoose = require('mongoose'),
    config = require("../../config"),
    userSchema = require("./models/user").userSchema,
    PassportLocalStrategy = require('passport-local').Strategy;

mongoose.Promise = require('bluebird');
var authService = {};

authService.signupStrategy = new PassportLocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    session: false,
    passReqToCallback: true
}, (req, username, password, done) => {

    const userData = {
        firstname: req.body.firstname.trim(),
        lastname: req.body.lastname.trim(),
        email: req.body.email.trim(),
        username: username.trim(),
        password: password.trim()

    };

    var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
    var userModel = db.model("users", userSchema);
    var x = 1;
    const newUser = new userModel(userData);
    newUser.save((err) => {
        if (err) {
            return done(err);
        }
        return done(null);
    })
        .finally(function () {
            db.close();
        });
});

authService.loginStrategy = new PassportLocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    session: false,
    passReqToCallback: true
}, (req, username, password, done) => {
    const userData = {
        username: username.trim(),
        password: password.trim()
    };

    var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
    var userModel = db.model("users", userSchema);

    // find a user by username
    return userModel.findOne({ username: userData.username }, (err, user) => {
        if (err) {
            return done(err);
        }

        if (!user) {
            const error = new Error('Incorrect username or password');
            error.name = 'IncorrectCredentialsError';

            return done(error);
        }

        // check if a hashed user's password is equal to a value saved in the database
        return user.comparePassword(userData.password, (passwordErr, isMatch) => {
            if (err) { return done(err); }

            if (!isMatch) {
                const error = new Error('Incorrect username or password');
                error.name = 'IncorrectCredentialsError';

                return done(error);
            }

            const payload = {
                id: user._id,
                username: user.username
            };

            // create a token string
            const token = jwt.sign(payload, config.jwtSecret);
            const data = {
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname
            };

            return done(null, token, data);
        });
    });
});

module.exports = authService;