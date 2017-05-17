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
        firstname: req.body.firstname.trim(),
        lastname: req.body.lastname.trim(),
        email: req.body.email.trim(),
        username: username.trim(),
        password: password.trim(),
        roles: req.roles ? req.roles : ['student']

    };
    console.log('Trying to register user:' + JSON.stringify(userData));
    var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
    var userModel = db.model("users", userSchema);

    const newUser = new userModel(userData);
    newUser.save((err, user) => {
            if (err) {
                return done(err);
            }
            return done(null, user);
        })
        .finally(function() {
            db.close();
        });
});