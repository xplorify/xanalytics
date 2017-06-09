"use strict";

var express = require("express"),
  bodyParser = require("body-parser"),
  errorhandler = require("errorhandler"),
  morgan = require("morgan"),
  passport = require('passport'),
  fs = require("fs"),
  https = require("https"),
  cipher = require("./cert/cipher"),
  config = require("./config"),
  analyticsService = require("./services/analytics-service");
var logger = require('./log/log.js');

var app = express();

// app.configure ya no existe
app.use(errorhandler({
  dumpExceptions: true,
  showStack: true
}));


app.use(require("morgan")("combined", { stream: logger.stream }));

app.use(express.static(__dirname + "/../dashboard"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
  res.header("Access-Control-Allow-Headers", "origin, content-type, Authorization");
  res.header("Content-Type", "application/json");
  if (req.method === "OPTIONS") {
    res.send(200);
  } else {
    next();
  }
});

// routes
const routes = require('./routes')(app);


// first close all open connections due to server restart,
// then start HTTPS server
// then start WS server
analyticsService.closeOpenConnections()
  .then(function() {
    logger.info('All open connections have been closed.');

    logger.info('Initializing https server...');
    cipher.unlock(cipher.k, "./cert/.woogeen.keystore", function cb(err, obj) {
      if (!err) {
        try {
          var server = https
            .createServer({
              pfx: fs.readFileSync("./cert/certificate.pfx"),
              passphrase: obj.sample
            }, app)
            .listen(config.httpsPort);

          logger.info('Initializing WS server...');
          require('./routes/echo').init(server);
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
