"use strict";

var analyticsService = require("../../services/analytics-service");
var storeService = require("../../services/store-service");
var logger = require("winston");

module.exports = {
    getConnection: function (req, res) {
        res.header("Content-Type", "application/json");
        var id = req.params.connectionId;
        logger.info(id);
        return analyticsService
            .getConnectionById(id)
            .then(function (result) {
                logger.info("result " + result);
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            });
    },
    getConnections: function (req, res) {
        res.header("Content-Type", "application/json");
        return analyticsService
            .getConnections()
            .then(function (result) {
                logger.info("result " + result);
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            });
    },
    getOpenConnections: function (req, res) {
        var code = req.query.code;
        logger.info("code " + code);
        res.header("Content-Type", "application/json");
        return analyticsService
            .getOpenConnections(code)
            .then(function (result) {
                logger.info("result " + result);
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            });
    },
    getAnalytics: function (req, res) {
        var data = {
            from: req.query.from,
            to: req.query.to,
            username: req.query.username,
            countryCode: req.query.countryCode,
            ipAddress: req.query.ipAddress,
            referrer: req.query.referrer,
            navigateTo: req.query.navigateTo,
            groupBy: req.query.groupBy,
            isDetailed: req.query.isDetailed,
            browser: req.query.browser,
            operatingSystem: req.query.operatingSystem
        };
        logger.info("data " + JSON.stringify(data));
        res.header("Content-Type", "application/json");
        return analyticsService
            .getAnalytics(data)
            .then(function (result) {
                logger.info("result " + result);
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            });
    },
    createConnection: function (req, res) {
        res.header("Content-Type", "application/json");
        var data = {
            body: req.body
        };
        logger.info("create connection request start");
        return analyticsService
            .createConnection(data)
            .then(function (response) {
                var info = {
                    data: {
                        _id: response._id,
                        previousConnectionId: response.previousConnectionId,
                        userName: response.userName,
                        remoteAddress: response.remoteAddress,
                        userAgent: response.userAgent,
                        countryCode: response.countryCode,
                        events: [response.events],
                        startDate: response.startDate
                    }
                };
                storeService.notifyAdmin(info);
                logger.info("create connection request end");
                logger.info("result " + response);
                res.send({ result: response });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            });
    },
    addNewEvent: function (req, res) {
        res.header("Content-Type", "application/json");
        logger.info("Add new event " + JSON.stringify(req.body));
        logger.info("create connection request start");
        return analyticsService
            .addNewEvent(req.body)
            .then(function (result) {
                storeService.notifyAdmin(result);
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            });
    },
    addUserInfo: function (req, res) {
        res.header("Content-Type", "application/json");
        logger.info("Add new event " + JSON.stringify(req.body));
        logger.info("create connection request start");
        return analyticsService
            .addUserInfo(req.body)
            .then(function (result) {
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            });
    },
    closeConnection: function (req, res) {
        res.header("Content-Type", "application/json");
        logger.info("Add new event " + JSON.stringify(req.body.connectionId));
        logger.info("create connection request start");
        var connectionId = req.body.connectionId;
        return analyticsService
            .closeConnection(connectionId)
            .then(function (result) {
                analyticsService.disconnectUser(connectionId);
                var infoObj = {
                    removeConnection: connectionId
                };
                logger.info("Before notifying admin...");
                storeService.notifyAdmin(infoObj);
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            });
    }
};