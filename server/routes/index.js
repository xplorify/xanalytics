var express = require('express'),
    passport = require('passport');
var apiRoutes = express.Router();

module.exports = function(app) {
    app.use(passport.initialize());

    // init auth
    passport.use('local-signup', require('./middleware/register-strategy'));
    passport.use('local-login', require('./middleware/login-strategy'));
    passport.use('jwt', require('./middleware/jwt-strategy'));

    // init routes
    apiRoutes.use('/', require('./analytics'));
    apiRoutes.use('/auth', require('./auth'));
    apiRoutes.use('/application', require('./application'));
    apiRoutes.use('/ip', require('./ip'));

    app.use('/api', apiRoutes);
};