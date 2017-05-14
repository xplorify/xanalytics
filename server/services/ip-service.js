"use strict";

var config = require("../config"),
    fetch = require("node-fetch"),
    ipService = {};

ipService.getGeoIpInfo = function(ipAddress) {
    console.log('IP address: ' + ipAddress);
    var url = config.freeGeoIpUrl + "/" + ipAddress;
    console.log("url: " + url);
    return fetch(url, {
            method: 'GET'
        })
        .then(function(res) {
            return res.json();
        });
}

module.exports = ipService;