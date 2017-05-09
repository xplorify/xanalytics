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
    path = require('path'),
    mime = require('mime'),
    mongoose = require('mongoose'),
    sockjs = require('sockjs'),
    analytics = require("./analytics/ws/analytics"),
    analyticsModel = require("./analytics/models/analytics"),
    analyticsService = require("./analytics/services/analytics/analytics-service");

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

app.use(function (req, res, next) {
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

require('./analytics/api/analytics-controller')(app, config);
require('./analytics/api/ip-controller')(app, config);
analyticsService.closeOpenConnections()
    .then(function () {
        console.log("inside then");
        //create socket
        var echo = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });
        echo.on('connection', function (conn) {
            console.log("CONN  " + conn);
            var connectionId = conn.url.split("/")[3];
            analyticsModel.users[connectionId] = conn;
            conn.on('data', function (message) { analytics.onData(conn, message) });
            conn.on('close', function () { analytics.onClose(conn) });
        });

        // create http server
        // app.listen(process.env.PORT || config.httpPort);

        // create https server
        var cipher = require("./cipher");
        cipher.unlock(cipher.k, "cert/.woogeen.keystore", function cb(err, obj) {
            if (!err) {
                try {
                    var server = https.createServer({
                        pfx: fs.readFileSync("cert/certificate.pfx"),
                        passphrase: obj.sample
                    }, app).listen(config.httpsPort);
                    echo.installHandlers(server, { prefix: '/echo' });
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

