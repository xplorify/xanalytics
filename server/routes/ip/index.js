var express = require('express'),
    controller = require('./controller');

var ipRoutes = express.Router();

ipRoutes.get(
    '/getGlobals',
    controller.getGlobals);

module.exports = ipRoutes;