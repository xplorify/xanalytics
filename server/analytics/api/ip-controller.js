"use strict";

var ipService = require("../services/ip/ip-service");

module.exports = function (app, config) {
    app.get("/getGlobals", function (request, res) {
        res.header("Content-Type", "application/json");
        var ip = request.headers['x-forwarded-for'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.connection.socket.remoteAddress;
        var ipAddresses = ip.split(',');
        var promises = [];
        ipAddresses.forEach(function (ipAddress) {
            ipAddress = ipAddress.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
            if (ipAddress == "1") {
                ipAddress = "95.86.38.12";
            }
            var p = ipService.getGeoIpInfo(ipAddress);
            promises.push(p);
        });
        var result = [];
        Promise.all(promises)
            .then(function (values) {
                values.forEach(function (value) {
                    result.push({
                        countryCode: value.country_code,
                        ipAddress: value.ip
                    });
                });
                res.send({ result: result });
            })
            .catch(function (err) {
                res.status(500);
                console.log("Ip Controller catch: " + err);
                res.send({ error: err });
            });


    });

    app.get("/getIpAddresses", function (request, res) {
        res.header("Content-Type", "application/json");
        var ip = request.headers['x-forwarded-for'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.connection.socket.remoteAddress;
        var ipAddresses = ip.split(',');
        res.send({ result: ipAddresses });
    });
};