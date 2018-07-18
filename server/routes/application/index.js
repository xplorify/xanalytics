var express = require('express'),
  controller = require('./controller');


var applicationRoutes = express.Router();

applicationRoutes.get(
  '/getDevApps',
  controller.getDevApps);
  applicationRoutes.get(
  '/getPrdApps',
  controller.getPrdApps);
  applicationRoutes.get(
    '/getMetproApps',
    controller.getMetproApps);

module.exports = applicationRoutes;
