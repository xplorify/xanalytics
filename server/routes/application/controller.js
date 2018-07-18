"use strict";
var logger = require("winston");
module.exports = {

  getDevApps: function (req, res) {
    res.header("Content-Type", "application/json");
    logger.info("JSON File:");
    var result = require("../../resources/devApps.json");
    if (result) {
      res.send({ result: result });
    } else {
      res.status(500);
      res.send({ error: res.status });
    }
  },
  
  getPrdApps: function (req, res) {
    res.header("Content-Type", "application/json");
    logger.info("JSON File:");
    var result = require("../../resources/prdApps.json");
    if (result) {
      res.send({ result: result });
    } else {
      res.status(500);
      res.send({ error: res.status });
    }
  },
  getMetproApps: function (req, res) {
    res.header("Content-Type", "application/json");
    logger.info("JSON File:");
    var result = require("../../resources/metApps.json");
    if (result) {
      res.send({ result: result });
    } else {
      res.status(500);
      res.send({ error: res.status });
    }
  }
};
