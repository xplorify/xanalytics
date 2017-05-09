"use strict";

var mongoose = require('mongoose');
var analyticsService = require("../services/analytics/analytics-service");

module.exports = function (app, config) {
    app.get("/getConnections", function (req, res) {
        res.header("Content-Type", "application/json");
        return analyticsService.getConnections()
            .then(function (result) {
                console.log("result " + result);
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            });
    });

    app.get("/getConnection/:connectionId", function (req, res) {
        "use strict";
        res.header("Content-Type", "application/json");
        var id = req.params.connectionId;
        console.log(id);
        return analyticsService.getConnectionByConnectionId(id)
            .then(function (result) {
                console.log("result " + result);
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            });
    });

    app.get("/getOpenConnections", function (req, res) {
        "use strict";
        var code = req.query.code;
        console.log("code " + code);
        res.header("Content-Type", "application/json");
        return analyticsService.getOpenConnections(code)
            .then(function (result) {
                console.log("result " + result);
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            });
    });

    app.post("/createConnection", function (req, res) {
        "use strict";
        res.header("Content-Type", "application/json");
        var data = {
            body: req.body,
            userAgent: req.headers['user-agent']
        }
        console.log("create connection request start");
        return analyticsService.createConnection(data)
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
                }
                analyticsService.notifyAdmin(info);
                console.log("create connection request end");
                console.log("result " + response);
                res.send({ result: response });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            })
    });

    app.post("/addNewEvent", function (req, res) {
        "use strict";
        res.header("Content-Type", "application/json");
        console.log("Add new event " + JSON.stringify(req.body));
        console.log("create connection request start");
        return analyticsService.addNewEvent(req.body)
            .then(function (result) {
                analyticsService.notifyAdmin(result);
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            })
    });

    app.post("/closeConnection", function (req, res) {
        "use strict";
        res.header("Content-Type", "application/json");
        console.log("Add new event " + JSON.stringify(req.body.connectionId));
        console.log("create connection request start");
        var connectionId = req.body.connectionId;
        return analyticsService.closeConnection(connectionId)
            .then(function (result) {
                analyticsService.disconnectUser(connectionId);
                var infoObj = {
                    removeConnection: connectionId
                }
                analyticsService.notifyAdmin(infoObj);
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            })
    });
};