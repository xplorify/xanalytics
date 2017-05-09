"use strict";

var ipService = require("../services/ip/ip-service");

module.exports = function (app, config) {
    app.get("/getGlobals", function (req, res) {
        var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        return ipService.getGeoIpInfo(ip)
            .then(function (result) {
                res.send({ result:  result });
            })
            .catch(function (err) {
                res.status(500);
                res.send({ error: err });
            });
    });
};