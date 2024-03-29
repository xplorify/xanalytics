var express = require('express'),
    controller = require('./controller');

var analyticsRoutes = express.Router();

// get
analyticsRoutes.get(
    '/getConnection/:connectionId',
    controller.getConnection);
analyticsRoutes.get(
    '/getConnections',
    controller.getConnections);
analyticsRoutes.get(
    '/getOpenConnections',
    controller.getOpenConnections);
analyticsRoutes.get(
    '/getAnalytics',
    controller.getAnalytics);
analyticsRoutes.get(
    '/getConnectionsByGroupKey',
    controller.getConnectionsByGroupKey);
analyticsRoutes.get(
    '/getReportById',
    controller.getReportById);

// post
analyticsRoutes.post(
    '/createConnection',
    controller.createConnection);
analyticsRoutes.post(
    '/addNewEvent',
    controller.addNewEvent);
analyticsRoutes.post(
    '/addUserInfo',
    controller.addUserInfo);
analyticsRoutes.post(
    '/closeConnection',
    controller.closeConnection);
analyticsRoutes.post(
    '/sendDailyAnalytics',
    controller.sendDailyAnalytics);
analyticsRoutes.post(
    '/sendWeeklyAnalytics',
    controller.sendWeeklyAnalytics);

module.exports = analyticsRoutes;