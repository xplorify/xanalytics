"use strict";

var jwt = require('jsonwebtoken');
var passport = require('passport');
var User = require('../../models/user');
var config = require('../../config');

var validateRegister = require('./validators/validate-register');
var validateLogin = require('./validators/validate-login');

function generateToken(user) {
    return jwt.sign(user, config.jwtSecret, {
        expiresIn: 10080
    });
}

function setUserInfo(user) {
    return {
        _id: user._id,
        username: user.username,
        roles: user.roles
    };
}

module.exports = {
    login: function(req, res, next) {
        const validationResult = validateLogin(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.message,
                errors: validationResult.errors
            });
        }
        return passport.authenticate('local-login', (err, user) => {
            if (err) {
                console.error(err);
                if (err.name === 'IncorrectCredentialsError') {
                    return res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: 'Could not process the form'
                });
            }
            var userInfo = setUserInfo(user);
            return res.status(200).json({
                success: true,
                token: 'JWT ' + generateToken(userInfo),
                user: userInfo
            });
        })(req, res, next);
    },
    register: function(req, res, next) {
        const validationResult = validateRegister(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.message,
                errors: validationResult.errors
            });
        }
        return passport.authenticate('local-signup', (err, user) => {
            if (err) {
                console.error(err);
                if (err.name === 'MongoError' && err.code === 11000) {
                    // the 11000 Mongo code is for a duplication email error
                    // the 409 HTTP status code is for conflict error
                    return res.status(409).json({
                        success: false,
                        message: 'Check the form for errors.',
                        errors: {
                            email: 'This email is already taken.'
                        }
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: 'Could not process the form.'
                });
            }

            var userInfo = setUserInfo(user);
            return res.status(200).json({
                success: true,
                token: 'JWT ' + generateToken(userInfo),
                user: userInfo
            });
        })(req, res, next);
    },
    protected: function(req, res, next) {
        res.send({ content: 'Success' });
    },
    roleAuthorization: function(roles) {
        return function(req, res, next) {

            var user = req.user;

            User.findById(user._id, function(err, foundUser) {

                if (err) {
                    res.status(422).json({ error: 'No user found.' });
                    return next(err);
                }

                if (roles.indexOf(foundUser.role) > -1) {
                    return next();
                }

                res.status(401).json({ error: 'You are not authorized to view this content' });
                return next('Unauthorized');

            });
        };
    }
};