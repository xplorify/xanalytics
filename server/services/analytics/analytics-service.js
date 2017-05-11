"use strict";

var mongoose = require('mongoose'),
    config = require("../../config"),
    connectionSchema = require("./models/connection"),
    util = require('util');
mongoose.Promise = require('bluebird');
var analyticsService = {};
analyticsService.Connection = mongoose.model("connections", connectionSchema);

analyticsService.createConnection = function(data) {
    console.log("inside create conn ");
    return new Promise(function(resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connection = analyticsService.getNewConnectionObject(db, data);
        console.log("db: " + db);
        console.log("CONN OBJ " + connection);
        return connection.save(function(err, response) {
                if (!err) {
                    resolve(response);
                } else {
                    reject(new Error(err));
                }
            })
            .finally(function() {
                db.close();
            });
    });
}

analyticsService.getConnections = function() {
    return new Promise(function(resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        console.log("before find");
        return connectionModel.find()
            .exec(function(err, response) {
                if (!err) {
                    console.log("Result: " + response);
                    resolve(response);
                } else {
                    console.log("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function() {
                db.close();
            });
    });
};

analyticsService.getOpenConnections = function(code) {
    return new Promise(function(resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        console.log("before find");
        var query = code ?
            { '$match': { 'endDate': { '$exists': false }, "events.eventType": "Navigate", "application.code": code } } :
            { '$match': { 'endDate': { '$exists': false }, "events.eventType": "Navigate" } }
        return connectionModel.aggregate(query)
            .exec(function(err, response) {
                if (!err) {
                    console.log("Result: " + response);
                    resolve(response);
                } else {
                    console.log("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function() {
                db.close();
            });
    });
};

analyticsService.getAnalytics = function(data) {
    return new Promise(function(resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        console.log("before find");
        var query = data.navigateTo ?
            data.groupBy ?
            [
                { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo } },
                { '$group': { "_id": '$' + data.groupBy, "connections": { $push: "$$ROOT" } } }
            ] :
            { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo } } :
            data.groupBy ?
            [
                { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) } } },
                { '$group': { "_id": '$' + data.groupBy, "connections": { $push: "$$ROOT" } } }
            ] :
            { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) } } }

        if (data.username) {
            query.$match.userName = data.username
        }
        if (data.ipAddress) {
            query.$match.remoteAddress = data.ipAddress
        }
        if (data.countryCode) {
            query.$match.countryCode = data.countryCode
        }
        if (data.referrer) {
            query.$match.referrer = data.referrer
        }

        console.log("query " + JSON.stringify(query));
        return connectionModel.aggregate(query)
            .exec(function(err, response) {
                if (!err) {
                    console.log("Result: " + response);
                    resolve(response);
                } else {
                    console.log("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function() {
                db.close();
            });
    });
};

analyticsService.closeOpenConnections = function() {
    return new Promise(function(resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        console.log("before update many");
        return connectionModel.updateMany({ endDate: undefined }, { $set: { endDate: new Date().toISOString() } })
            .exec(function(err, response) {
                if (!err) {
                    console.log("Result: " + response);
                    resolve(response);
                } else {
                    console.log("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function() {
                db.close();
            });
    });
};

analyticsService.getConnectionById = function(id) {
    return new Promise(function(resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        console.log("before find");
        return connectionModel.findById(id)
            .exec(function(err, response) {
                if (!err) {
                    console.log("Result: " + response);
                    resolve(response);
                } else {
                    console.log("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function() {
                db.close();
            });
    });
};

analyticsService.closeConnection = function(connectionId) {
    try {
        return new Promise(function(resolve, reject) {
            var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
            var connectionModel = db.model("connections", connectionSchema);
            console.log("Before end date update");
            var endDate = new Date().toISOString();
            return connectionModel.update({ _id: connectionId }, {
                    $set: { endDate: endDate }
                })
                .exec()
                .then(function(result) {
                    console.log("End date updated: " + result);
                    resolve(result);
                });
        });
    } catch (e) {
        console.log("Save failed");
        console.log("Error: " + e);
    } finally {
        console.log("finally block");
        return mongoose.disconnect();
    }
};

analyticsService.addNewEvent = function(data) {
    return new Promise(function(resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        var isUserNamePresent = data.userName && data.userName !== "Anonymous";
        var updateObject = {
            $push: {
                events: {
                    eventType: data.eventType,
                    url: data.to,
                    date: new Date().toISOString(),
                    info: {
                        roomId: data.roomId,
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
            .then(function(response) {
                console.log("Result: " + response);
                resolve(response);
            })
            .catch(function(err) {
                reject(new Error(err));
            })
            .finally(function() {
                db.close();
            });
    });
};

analyticsService.getNewConnectionObject = function(db, data) {
    var obj = {
        previousConnectionId: data.body.previousConnId,
        startDate: new Date().toISOString(),
        userName: data.body.userName,
        countryCode: data.body.countryCode,
        remoteAddress: data.body.ipAddress,
        detectRtc: data.body.detectRtc,
        referrer: data.body.referrer,
        application: data.body.application,
        events: [{
            eventType: data.body.eventType,
            date: new Date().toISOString(),
            url: data.body.to
        }]
    };
    var connectionModel = db.model("connections", connectionSchema);
    var connection = new connectionModel(obj);
    return connection;
};

module.exports = analyticsService;