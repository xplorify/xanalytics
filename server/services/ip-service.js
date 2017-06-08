"use strict";

var config = require("../config"),
    fetch = require("node-fetch"),
    logger = require("winston"),
    ipService = {};

ipService.getGeoIpInfo = function(ipAddress) {
    logger.info('IP address: ' + ipAddress);
    var url = config.freeGeoIpUrl + "/" + ipAddress;
    logger.info("url: " + url);
    return fetch(url, {
            method: 'GET'
        })
        .then(function(res) {
            return res.json();
        });
}

module.exports = ipService;