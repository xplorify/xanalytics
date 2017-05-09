"use strict";

var mongoose = require('mongoose');
var analytics = require("../services/analytics/analytics-service");

module.exports = function (app, config) {
    app.get("/getConnections", function (req, res) {
        res.header("Content-Type", "application/json");
        return analytics.getConnections()
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
        return analytics.getConnectionByConnectionId(id)
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
        return analytics.getOpenConnections(code)
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
        return analytics.createConnection(data)
            .then(function (result) {
                console.log("create connection request end");
                console.log("result " + result);
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            })
    });
};