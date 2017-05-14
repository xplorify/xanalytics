"use strict";

var ipService = require("../../services/ip-service");

module.exports = {
    getGlobals: function(request, res) {
        res.header("Content-Type", "application/json");
        var ip = request.headers['x-forwarded-for'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.connection.socket.remoteAddress;
        ip = ip.split(',')[0];
        ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
        if (ip == "1") {
            ip = "::1";
        }

        return ipService.getGeoIpInfo(ip)
            .then(function(result) {
                console.log("Ip Controller: " + result);
                res.send({ result: result });
            })
            .catch(function(err) {
                res.status(500);
                console.log("Ip Controller catch: " + err);
                res.send({ error: err });
            });
    }
};