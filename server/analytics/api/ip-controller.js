"use strict";

var ipService = require("../services/ip/ip-service");

module.exports = function (app, config) {
    app.get("/getGlobals", function (req, res) {
        res.header("Content-Type", "application/json");
        var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        return ipService.getGeoIpInfo(ip)
            .then(function (result) {
                console.log("Ip Controller: " + result);
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                console.log("Ip Controller catch: " + err);
                res.send({ error: err });
            });
    });
};