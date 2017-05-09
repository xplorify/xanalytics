"use strict";

var config = require("./../../../config"),
    fetch = require("node-fetch"),
    ipService = {};

ipService.getGeoIpInfo = function (ipAddress) {
    if (ipAddress == "::1") {
        ipAddress = "95.86.38.12";
    }
    console.log('IP address: ' + ipAddress);
    return fetch(config.freeGeoIpUrl + "/" + ipAddress, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(function (res) {
            console.log('FreeGeopIP result: ' + res.json());
            return res.json();
        });
}

module.exports = ipService;