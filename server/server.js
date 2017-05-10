/*global require, __dirname, console, process*/
"use strict";

var express = require("express"),
    bodyParser = require("body-parser"),
    errorhandler = require("errorhandler"),
    morgan = require("morgan"),
    fs = require("fs"),
    https = require("https"),
    http = require("http"),
    config = require("./config"),
    analyticsService = require("./services/analytics/analytics-service");

var app = express();

// app.configure ya no existe
app.use(errorhandler({
    dumpExceptions: true,
    showStack: true
}));
app.use(morgan("dev"));
app.use(express.static("../client"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    res.header("Access-Control-Allow-Headers", "origin, content-type");
    res.header("Content-Type", "application/json");
    if (req.method === "OPTIONS") {
        res.send(200);
    } else {
        next();
    }
});

require('./api/analytics-api')(app);
require('./api/ip-api')(app);
var analyticsWs = require('./api/analytics-ws');

// first close all open connections due to server restart,
// then start WS server
// then start HTTP server
analyticsService.closeOpenConnections()
    .then(function() {
        console.log("inside then");
        // create https server
        var cipher = require("./cipher");
        cipher.unlock(cipher.k, "cert/.woogeen.keystore", function cb(err, obj) {
            if (!err) {
                try {
                    var server = https.createServer({
                        pfx: fs.readFileSync("cert/certificate.pfx"),
                        passphrase: obj.sample
                    }, app).listen(config.httpsPort);
                    analyticsWs.echo.installHandlers(server, { prefix: '/echo' });
                } catch (e) {
                    err = e;
                }
            }
            if (err) {
                console.error("Failed to setup secured server:", err);
                return process.exit();
            }
        });
    });