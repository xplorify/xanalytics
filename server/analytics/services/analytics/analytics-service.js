"use strict";

var mongoose = require('mongoose'),
    config = require("./../../../config"),
    connectionSchema = require("./models/connection").connectionSchema,
    analyticsModel = require("../../models/analytics/index"),
    util = require('util');
mongoose.Promise = require('bluebird');
var analyticsService = {};
analyticsService.Connection = mongoose.model("connections", connectionSchema);

analyticsService.createConnection = function (data) {
    console.log("inside create conn ");
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connection = analyticsService.getNewConnectionObject(db, data);
        console.log("db: " + db);
        console.log("CONN OBJ " + connection);
        return connection.save(function (err, response) {
            if (!err) {
                //find admin and send message
                analyticsService.sendMessageToAdmin(response);
                console.log("Result: " + response);
                resolve(response);
            } else {
                reject(new Error(err));
            }
        })
            .finally(function () {
                db.close();
            });
    });
}

analyticsService.getConnections = function () {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        console.log("before find");
        return connectionModel.find()
            .exec(function (err, response) {
                if (!err) {
                    console.log("Result: " + response);
                    resolve(response);
                } else {
                    console.log("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function () {
                db.close();
            });
    });
};

analyticsService.sendMessageToAdmin = function (data) {
    for (var k in analyticsModel.admin) {
        if (analyticsModel.admin.hasOwnProperty(k)) {
            var info = {
                data: {
                    _id: data._id,
                    previousConnectionId: data.previousConnectionId,
                    userName: data.userName,
                    remoteAddress: data.remoteAddress,
                    userAgent: data.userAgent,
                    countryCode: data.countryCode,
                    events: [data.events],
                    startDate: data.startDate
                }
            }
            var infoString = JSON.stringify(info);
            analyticsModel.admin[k].write(infoString);
        }
    }
};

analyticsService.getOpenConnections = function (code) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        console.log("before find");
        var query = code
            ? { '$match': { 'endDate': { '$exists': false }, "events.eventType": "Navigate", "application.code": code } }
            : { '$match': { 'endDate': { '$exists': false }, "events.eventType": "Navigate" } }
        return connectionModel.aggregate(query)
            .exec(function (err, response) {
                if (!err) {
                    console.log("Result: " + response);
                    resolve(response);
                } else {
                    console.log("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function () {
                db.close();
            });
    });
};

analyticsService.closeOpenConnections = function () {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        console.log("before update many");
        return connectionModel.updateMany(
            { endDate: undefined },
            { $set: { endDate: new Date().toISOString() } }
        )
            .exec(function (err, response) {
                if (!err) {
                    console.log("Result: " + response);
                    resolve(response);
                } else {
                    console.log("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function () {
                db.close();
            });
    });
};

analyticsService.getConnectionByConnectionId = function (id) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        console.log("before find");
        return connectionModel.findById(id)
            .exec(function (err, response) {
                if (!err) {
                    console.log("Result: " + response);
                    resolve(response);
                } else {
                    console.log("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function () {
                db.close();
            });
    });
};

analyticsService.setConnectionEndDate = function (connectionId) {
    try {
        return new Promise(function (resolve, reject) {
            var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
            var connectionModel = db.model("connections", connectionSchema);
            console.log("Before end date update");
            var endDate = new Date().toISOString();
            return connectionModel.update({ _id: connectionId },
                {
                    $set: { endDate: endDate }
                })
                .exec()
                .then(function (result) {
                    console.log("End date updated: " + result);
                    resolve(result);
                });
        });
    }
    catch (e) {
        console.log("Save failed");
        console.log("Error: " + e);
    }
    finally {
        console.log("finally block");
        return mongoose.disconnect();
    };
};

analyticsService.addNewEvent = function (data) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        var isUserNamePresent = data.userName && data.userName !== "Anonymous";
        var updateObject = {
            $push: {
                events: {
                    eventType: data.eventType,
                    date: new Date().toISOString(),
                    info: {
                        roomId: data.roomId,
                        from: data.from,
                        to: data.to,
                        loginType: data.loginType
                    }
                }
            }
        };
        if (isUserNamePresent) {
            updateObject.$set = { userName: data.userName };
        }
        return connectionModel.findByIdAndUpdate(data.connectionId, updateObject, { new: true })
            .exec()
            .then(function (response) {
                console.log("Result: " + response);
                resolve(response);
            })
            .catch(function (err) {
                reject(new Error(err));
            })
            .finally(function () {
                db.close();
            });
    });
};

analyticsService.getNewConnectionObject = function (db, data) {
    var obj = {
        previousConnectionId: data.body.previousConnId,
        startDate: new Date().toISOString(),
        userName: data.body.userName,
        countryCode: data.body.countryCode,
        remoteAddress: data.body.ipAddress,
        userAgent: data.userAgent,
        detectRtc: data.body.detectRtc,
        referrer: data.body.referrer,
        application: data.body.application,
        events: [{
            eventType: data.body.eventType
        }]
    };
    var connectionModel = db.model("connections", connectionSchema);
    var connection = new connectionModel(obj);
    return connection;
}

analyticsService.notifyAdmin = function(info){
      var connectionsCount = analyticsModel.users ? Object.keys(analyticsModel.users).length : 0;
            console.log("connections count " + connectionsCount);
            // find admin connection and send him the connections count
            console.log("Preparing to send admins message ... ");
            console.log("admin keys: " + Object.keys(analyticsModel.admin));
            var infoString = JSON.stringify(info);
            console.log("Sending message: " + infoString);
            for (var k in analyticsModel.admin) {
                if (analyticsModel.admin.hasOwnProperty(k)) {
                    //sending to admin the latest user event for a specific connection
                    console.log("to admin " + analyticsModel.admin[k].userName);
                    analyticsModel.admin[k].write(infoString);
                }
            }
}

module.exports = analyticsService;