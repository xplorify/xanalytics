var express = require('express'),
    controller = require('./controller'),
    passport = require('passport');

var requireAuth = passport.authenticate('jwt', { session: false });


var authRoutes = express.Router();

authRoutes.post(
    '/register',
    controller.register);
authRoutes.post(
    '/login',
    controller.login);
authRoutes.get(
    '/protected',
    requireAuth,
    controller.protected);

module.exports = authRoutes;