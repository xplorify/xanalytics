"use strict";

var express = require("express"),
  bodyParser = require("body-parser"),
  errorhandler = require("errorhandler"),
  morgan = require("morgan"),
  passport = require("passport"),
  fs = require("fs"),
  https = require("https"),
  path = require("path"),
  cipher = require("./cert/cipher"),
  config = require("./config"),
  analyticsService = require("./services/analytics-service");
var logger = require("./log/log.js");

var app = express();

// app.configure ya no existe
app.use(
  errorhandler({
    dumpExceptions: true,
    showStack: true
  })
);

app.use(require("morgan")("combined", { stream: logger.stream }));
app.get(["/register", "/login", "/analytics"], function(req, res) {
  res.header("Content-Type", "text/html");
  res.sendFile(path.join(__dirname + "/../dashboard2/dist/index.html"));
});
app.use(express.static(__dirname + "/../dashboard2/dist/"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "origin, content-type, Authorization, Cache-Control"
  );
  res.header("Content-Type", "application/json");
  res.header("Cache-Control", "no-cache");
  if (req.method === "OPTIONS") {
    res.send(200);
  } else {
    next();
  }
});

// routes

const routes = require("./routes")(app);

// first close all open connections due to server restart,
// then start HTTPS server
// then start WS server

analyticsService.closeOpenConnections().then(function() {
  logger.info("All open connections have been closed.");
  if (process.env.NODE_ENV === "met") {
    logger.info("Initializing http server...");
    var httpServer = app.listen(process.env.PORT || config.httpPort);
    require("./routes/echo").init(httpServer);
  } else {
    logger.info("Initializing https server...");
    cipher.unlock(cipher.k, "./cert/.woogeen.keystore", function cb(err, obj) {
      if (!err) {
        try {
          var server = https
            .createServer(
              {
                pfx: fs.readFileSync("./cert/certificate.pfx"),
                passphrase: obj.sample
              },
              app
            )
            .listen(config.httpsPort);

          logger.info("Initializing WS server...");
          require("./routes/echo").init(server);
        } catch (e) {
          err = e;
        }
      }
      if (err) {
        console.error("Failed to setup secured server:", err);
        return process.exit();
      }
    });
  }
});
