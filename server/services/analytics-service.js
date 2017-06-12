"use strict";

var mongoose = require('mongoose'),
    config = require("../config"),
    connectionSchema = require("../models/connection"),
    util = require('util'),
    logger = require('winston');
mongoose.Promise = require('bluebird');
var analyticsService = {};
analyticsService.Connection = mongoose.model("connections", connectionSchema);

analyticsService.createConnection = function (data) {
    logger.info("Creating connection... " + JSON.stringify(data.body));
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connection = analyticsService.getNewConnectionObject(db, data);
        logger.info("CONN OBJ " + connection);
        return connection.save(function (err, response) {
            if (!err) {
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
        logger.info("before find");
        return connectionModel.find()
            .exec(function (err, response) {
                if (!err) {
                    logger.info("Result: " + response);
                    resolve(response);
                } else {
                    logger.error("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function () {
                db.close();
            });
    });
};

analyticsService.getOpenConnections = function (code) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        logger.info("before find");
        var query = code ? { '$match': { 'endDate': { '$exists': false }, "events.eventType": "Navigate", "application.code": code } } : { '$match': { 'endDate': { '$exists': false }, "events.eventType": "Navigate" } }
        return connectionModel.aggregate(query)
            .exec(function (err, response) {
                if (!err) {
                    logger.info("Result: " + response);
                    resolve(response);
                } else {
                    logger.error("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function () {
                db.close();
            });
    });
};

analyticsService.getDetailedQuery = function (data) {
    let aggregate = [];
    let groups = [];
    let $unwind = {
        '$unwind': {
            path: '$events',
            preserveNullAndEmptyArrays: false
        }
    }
    let $match = data.navigateTo
        ? { $match: { $and: [{ startDate: { "$gt": new Date(data.from), "$lt": new Date(data.to) } }, { "events.url": data.navigateTo }] } }
        : { $match: { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) } } };

    if (data.eventType) {
        $match.$match.$and
            ? $match.$match.$and.push({ "events.eventType": data.eventType })
            : $match.$match.$and = [{ "events.eventType": data.eventType }];
    }
    if (data.operatingSystem) {
        $match.$match.$and
            ? $match.$match.$and.push({ "detectRtc.osName": data.operatingSystem })
            : $match.$match.$and = [{ "detectRtc.osName": data.operatingSystem }];
    }
    if (data.browser && data.browser !== "Others") {
        $match.$match.$and
            ? $match.$match.$and.push({ "detectRtc.browser.name": data.browser })
            : $match.$match.$and = [{ "detectRtc.browser.name": data.browser }];
    }
    if (data.browser && data.browser === "Others") {
        if ($match.$match.$and) {
            $match.$match.$and.push({ "detectRtc.browser.name": { $ne: "Chrome" } });
            $match.$match.$and.push({ "detectRtc.browser.name": { $ne: "Firefox" } });
            $match.$match.$and.push({ "detectRtc.browser.name": { $ne: "Safari" } });
        } else {
            $match.$match.$and = [
                { "detectRtc.browser.name": { $ne: "Chrome" } },
                { "detectRtc.browser.name": { $ne: "Firefox" } },
                { "detectRtc.browser.name": { $ne: "Safari" } }
            ];
        }
    }

    if (data.groupBy) {
        if (data.groupBy === "events.url") {
            groups.push({
                '$group': {
                    "_id": { "event_url": '$events.url', "connection_id": "$_id" },
                    "connections": { $push: "$$ROOT" },
                    "count": { "$sum": 1 }
                }
            });
            groups.push({
                "$group": {
                    "_id": "$_id.event_url",
                    "data": { $push: { "connections": "$connections", "count": "$count" } },
                    "count": { $sum: "$count" }
                }
            });
        } else {
            if (data.navigateTo) {
                groups.push({
                    '$group': { "_id": { "group_by": '$' + data.groupBy, "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } }
                });
                groups.push({
                    "$group": { "_id": "$_id.group_by", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } }
                });
            } else {
                groups.push({
                    '$group': { "_id": '$' + data.groupBy, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } }
                });
            }
        }
    }
    else {
        if (data.navigateTo) {
            groups.push({
                '$group': {
                    "_id": "$_id",
                    "userName": { $first: "$userName" },
                    "remoteAddress": { $first: "$remoteAddress" },
                    "referrer": { $first: "$referrer" },
                    "detectRtc": { $first: "$detectRtc" },
                    "countryCode": { $first: "$countryCode" },
                    "application": { $first: "$application" },
                    "events": { $addToSet: "$events" }
                }
            });
        }
    }

    if (data.username) {
        $match.$match.$and ? $match.$match.$and.push({ "userName": data.username }) : $match.$match.$and = [{ "userName": data.username }];
    }
    if (data.ipAddress) {
        $match.$match.$and ? $match.$match.$and.push({ "remoteAddress": data.ipAddress }) : $match.$match.$and = [{ "remoteAddress": data.ipAddress }];
    }
    if (data.countryCode) {
        $match.$match.$and ? $match.$match.$and.push({ "countryCode": data.countryCode }) : $match.$match.$and = [{ "countryCode": data.countryCode }];
    }
    if (data.referrer) {
        $match.$match.$and ? $match.$match.$and.push({ "referrer": data.referrer }) : $match.$match.$and = [{ "referrer": data.referrer }];
    }
    if ((data.groupBy && data.groupBy === "events.url") || data.navigateTo) {
        aggregate.push($unwind);
    }

    aggregate.push($match);
    groups.forEach(function (g) {
        aggregate.push(g);
    });

    return aggregate;
}

analyticsService.getCountQuery = function (data) {
    let aggregate = [];
    let groups = [];
    let $unwind = {
        '$unwind': {
            path: '$events',
            preserveNullAndEmptyArrays: false
        }
    }
    let $match = data.navigateTo
        ? { $match: { $and: [{ startDate: { "$gt": new Date(data.from), "$lt": new Date(data.to) } }, { "events.url": data.navigateTo }] } }
        : { $match: { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) } } };

    if (data.operatingSystem) {
        $match.$match.$and
            ? $match.$match.$and.push({ "detectRtc.osName": data.operatingSystem })
            : $match.$match.$and = [{ "detectRtc.osName": data.operatingSystem }];
    }
    if (data.browser && data.browser !== "Others") {
        $match.$match.$and
            ? $match.$match.$and.push({ "detectRtc.browser.name": data.browser })
            : $match.$match.$and = [{ "detectRtc.browser.name": data.browser }];
    }
    if (data.browser && data.browser === "Others") {
        if ($match.$match.$and) {
            $match.$match.$and.push({ "detectRtc.browser.name": { $ne: "Chrome" } });
            $match.$match.$and.push({ "detectRtc.browser.name": { $ne: "Firefox" } });
            $match.$match.$and.push({ "detectRtc.browser.name": { $ne: "Safari" } });
        } else {
            $match.$match.$and = [
                { "detectRtc.browser.name": { $ne: "Chrome" } },
                { "detectRtc.browser.name": { $ne: "Firefox" } },
                { "detectRtc.browser.name": { $ne: "Safari" } }
            ];
        }
    }

    if (data.groupBy) {
        if (data.groupBy === "events.url") {
            groups.push({
                '$group': {
                    "_id": { "event_url": '$events.url', "connection_id": "$_id" },
                    "count": { "$sum": 1 }
                }
            });
            groups.push({
                "$group": {
                    "_id": "$_id.event_url",
                    "count": { $sum: "$count" }
                }
            });
        } else {
            if (data.navigateTo) {
                groups.push({
                    '$group': { "_id": { "group_by": '$' + data.groupBy, "connection_id": "$_id" }, "count": { "$sum": 1 } }
                });
                groups.push({
                    "$group": { "_id": "$_id.group_by", "data": { $push: { "count": "$count" } }, "count": { $sum: "$count" } }
                });
            } else {
                groups.push({
                    '$group': { "_id": '$' + data.groupBy, "count": { "$sum": 1 } }
                });
            }
        }
    }
    else {
        groups.push({ '$group': { "_id": null, "count": { "$sum": 1 } } });
    }

    if (data.username) {
        $match.$match.$and ? $match.$match.$and.push({ "userName": data.username }) : $match.$match.$and = [{ "userName": data.username }];
    }
    if (data.ipAddress) {
        $match.$match.$and ? $match.$match.$and.push({ "remoteAddress": data.ipAddress }) : $match.$match.$and = [{ "remoteAddress": data.ipAddress }];
    }
    if (data.countryCode) {
        $match.$match.$and ? $match.$match.$and.push({ "countryCode": data.countryCode }) : $match.$match.$and = [{ "countryCode": data.countryCode }];
    }
    if (data.referrer) {
        $match.$match.$and ? $match.$match.$and.push({ "referrer": data.referrer }) : $match.$match.$and = [{ "referrer": data.referrer }];
    }
    if ((data.groupBy && data.groupBy === "events.url") || data.navigateTo) {
        aggregate.push($unwind);
    }

    aggregate.push($match);
    groups.forEach(function (g) {
        aggregate.push(g);
    });

    return aggregate;
}

analyticsService.getAnalytics = function (data) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        logger.info("before find is detailed search: " + data.isDetailed);
        var query = data.isDetailed === "true" ? analyticsService.getDetailedQuery(data) : analyticsService.getCountQuery(data);
        logger.info("query " + JSON.stringify(query));
        return connectionModel.aggregate(query)
            .exec(function (err, response) {
                if (!err) {
                    logger.info("Result: " + response);
                    resolve(response);
                } else {
                    logger.error("err: " + err);
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
        logger.info("before update many");
        return connectionModel.updateMany({ endDate: undefined }, { $set: { endDate: new Date().toISOString() } })
            .exec(function (err, response) {
                if (!err) {
                    logger.info("Result: " + response);
                    resolve(response);
                } else {
                    logger.error("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function () {
                db.close();
            });
    });
};

analyticsService.getConnectionById = function (id) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        logger.info("before find");
        return connectionModel.findById(id)
            .exec(function (err, response) {
                if (!err) {
                    logger.info("Result: " + response);
                    resolve(response);
                } else {
                    logger.error("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function () {
                db.close();
            });
    });
};

analyticsService.closeConnection = function (connectionId) {
    try {
        return new Promise(function (resolve, reject) {
            var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
            var connectionModel = db.model("connections", connectionSchema);
            logger.info("Before end date update");
            var endDate = new Date().toISOString();
            return connectionModel.update({ _id: connectionId }, {
                $set: { endDate: endDate }
            })
                .exec()
                .then(function (result) {
                    logger.info("End date updated: " + result);
                    resolve(result);
                });
        });
    } catch (e) {
        logger.error("Save failed");
        logger.error("Error: " + e);
    } finally {
        logger.info("finally block");
        return mongoose.disconnect();
    }
};

analyticsService.addNewEvent = function (data) {
    logger.info("Adding new event...");
    return new Promise(function (resolve, reject) {
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
                    },
                    search: data.search
                }
            }
        };
        if (isUserNamePresent) {
            updateObject.$set = { userName: data.userName };
        }
        return connectionModel.findByIdAndUpdate(data.connectionId, updateObject, { new: true })
            .exec()
            .then(function (response) {
                logger.info("New event was sucessfully added: " + response);
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

analyticsService.addUserInfo = function (data) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        var isUserNamePresent = data.userName && data.userName !== "Anonymous";
        var updateObject = {
            $set: {
                userName: data.userName,
                userInfo: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email
                }
            }
        };
        return connectionModel.findByIdAndUpdate(data.connectionId, updateObject, { new: true })
            .exec()
            .then(function (response) {
                logger.info("Result: " + response);
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