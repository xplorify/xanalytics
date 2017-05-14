"use strict";

var mongoose = require('mongoose'),
    config = require("../../config"),
    userSchema = require("../../models/user"),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

mongoose.Promise = require('bluebird');

var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([ // a passport-jwt option determining where to parse the JWT
        ExtractJwt.fromHeader('Authorization'), // From "Authorization" header
        ExtractJwt.fromAuthHeaderWithScheme('Bearer'), // Allowing "Bearer" prefix        
        ExtractJwt.fromUrlQueryParameter('token') // From query-string parameter "token"
    ]),
    // jwtFromRequest: ExtractJwt.fromHeader('Authorization'),
    secretOrKey: config.jwtSecret
};

module.exports = new JwtStrategy(jwtOptions, function(payload, done) {
    var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
    var userModel = db.model("users", userSchema);
    if (payload) {
        console.log('User passed valid JWT token: ' + JSON.stringify(payload));
    } else {
        console.log('User didn\'t passe valid JWT token.');
    }
    return userModel
        .findById(payload._id)
        .exec((err, user) => {
            if (err) {
                return done(err, false);
            }
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        })
        .finally(function() {
            db.close();
        });
});