var express = require('express'),
  controller = require('./controller');


var applicationRoutes = express.Router();

applicationRoutes.get(
  '/getDevApps',
  controller.getDevApps);
  applicationRoutes.get(
  '/getPrdApps',
  controller.getPrdApps);

module.exports = applicationRoutes;
