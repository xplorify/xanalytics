"use strict";

var mongoose = require('mongoose'),
    config = require("../config"),
    connectionSchema = require("../models/connection"),
    reportSchema = require("../models/report"),
    util = require('util'),
    logger = require('winston');
mongoose.Promise = require('bluebird');
var analyticsService = {};
analyticsService.Connection = mongoose.model("connections", connectionSchema);
analyticsService.Report = mongoose.model("reports", reportSchema);
var ObjectId = mongoose.Types.ObjectId;

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

analyticsService.getMatchQuery = function (data) {
    let $match = data.navigateTo
        ? { $match: { $and: [{ startDate: { "$gt": new Date(data.from), "$lt": new Date(data.to) } }, { "events.url": data.navigateTo }] } }
        : { $match: { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) } } };

    if (data.lastId && data.isDetailed === "true") {
        $match.$match.$and
            ? $match.$match.$and.push({ "_id": { "$gt": ObjectId(data.lastId) } })
            : $match.$match.$and = [{ "_id": { "$gt": ObjectId(data.lastId) } }];
    }
    if (data.eventType) {
        $match.$match.$and
            ? $match.$match.$and.push({ "events.eventType": data.eventType })
            : $match.$match.$and = [{ "events.eventType": data.eventType }];
    }
    if (data.application) {
        $match.$match.$and
            ? $match.$match.$and.push({ "application.code": data.application })
            : $match.$match.$and = [{ "application.code": data.application }];
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

    return $match;
}

analyticsService.getDetailedQuery = function (data, getOnlyId) {
    console.log("inside detailed query");
    let aggregate = [];
    let groups = [];
    let $sort;

    if (getOnlyId) {
        $sort = { $sort: { "count": -1 } };
    } else {
        $sort = { $sort: { "_id": 1 } };
    }

    let $unwind = {
        '$unwind': {
            path: '$events',
            preserveNullAndEmptyArrays: false
        }
    }
    let $match = analyticsService.getMatchQuery(data);
    let $limit = null;

    if (data.pageSize && !data.groupBy) {
        $limit = { '$limit': parseInt(data.pageSize) };
    }

    if (data.groupBy) {
        if (data.groupBy === "events.url" || data.groupBy === "events.search.level.name" || data.groupBy === "events.search.language.name"
            || data.groupBy === "events.search.category.name" || data.groupBy === "events.search.origin.code") {
            groups.push({
                '$group': {
                    "_id": { "event_key": '$' + data.groupBy, "connection_id": "$_id" },
                    "count": { "$sum": 1 }
                }
            });
            groups.push({
                "$group": {
                    "_id": "$_id.event_key",
                    "count": { $sum: "$count" }
                }
            });
        } else {
            if (data.navigateTo || data.eventType) {
                groups.push({
                    '$group': { "_id": { "group_by": '$' + data.groupBy, "connection_id": "$_id" }, "count": { "$sum": 1 } }
                });
                groups.push({
                    "$group": { "_id": "$_id.group_by", "data": { $push: { "count": "$count" } }, "count": { $sum: "$count" } }
                });
            } else {
                groups.push({
                    '$group': {
                        "_id": '$' + data.groupBy,
                        "count": { "$sum": 1 },
                        "data": { $push: getOnlyId ? "$_id" : "$$ROOT" }
                    }
                });
            }
        }
    }
    else {
        if (data.navigateTo || data.eventType) {
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

    analyticsService.expandMatchQuery(data, $match);
    if (data.groupBy && (data.groupBy === "events.url" || data.groupBy === "events.search.level.name" || data.groupBy === "events.search.language.name"
        || data.groupBy === "events.search.category.name" || data.groupBy === "events.search.origin.code") || data.navigateTo || data.eventType) {
        aggregate.push($unwind);
    }

    aggregate.push($match);
    groups.forEach(function (g) {
        aggregate.push(g);
    });

    aggregate.push($sort);
    if (data.pageSize && !data.groupBy) {
        aggregate.push($limit);
    }

    logger.info("aggregate: " + JSON.stringify(aggregate));
    return aggregate;
}

analyticsService.getConnectionsByKey = function (data) {
    let aggregate = [];
    let groups = [];
    let $sort = { $sort: { "_id": 1 } };
    let $unwind = {
        '$unwind': {
            path: '$events',
            preserveNullAndEmptyArrays: false
        }
    }
    let $match = analyticsService.getMatchQuery(data);
    let $limit = null;

    if (data.pageSize) {
        $limit = { '$limit': parseInt(data.pageSize) };
    }

    analyticsService.expandMatchQuery(data, $match);
    var convertEventsToArray = false;

    if (data.groupBy && (data.groupBy === "events.url" || data.groupBy === "events.search.level.name" || data.groupBy === "events.search.language.name"
        || data.groupBy === "events.search.category.name" || data.groupBy === "events.search.origin.code") || data.navigateTo || data.eventType) {
        aggregate.push($unwind);
        convertEventsToArray = true;
    }

    if (data.key && data.groupBy) {
        var matchObject;
        switch (data.groupBy) {
            case "userName":
                matchObject = { "userName": data.key };
                break;
            case "remoteAddress":
                matchObject = { "remoteAddress": data.key };
                break;
            case "countryCode":
                matchObject = { "countryCode": data.key };
                break;
            case "referrer":
                matchObject = { "referrer": data.key };
                break;
            case "events.url":
                matchObject = { "events.url": data.key };
                break;
            case "events.search.origin.code":
                matchObject = { "events.search.origin.code": data.key };
                break;
            case "events.search.level.name":
                matchObject = { "events.search.level.name": data.key };
                break;
            case "events.search.language.name":
                matchObject = { "events.search.language.name": data.key };
                break;
            case "events.search.category.name":
                matchObject = { "events.search.category.name": data.key };
                break;
            case "detectRtc.browser.name":
                matchObject = { "detectRtc.browser.name": data.key };
                break;
            case "detectRtc.osName":
                matchObject = { "detectRtc.osName": data.key };
                break;
            case "application.code":
                matchObject = { "application.code": data.key };
                break;
        }

        $match.$match.$and
            ? $match.$match.$and.push(matchObject)
            : $match.$match.$and = [matchObject];
    }

    if (convertEventsToArray) {
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


    aggregate.push($match);

    groups.forEach(function (g) {
        aggregate.push(g);
    });
    aggregate.push($sort);
    if (data.pageSize) {
        aggregate.push($limit);
    }

    logger.info("aggregate: " + JSON.stringify(aggregate));
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
    let $match = analyticsService.getMatchQuery(data);

    if (data.groupBy) {
        if (data.groupBy === "events.url" || data.groupBy === "events.search.level.name" || data.groupBy === "events.search.language.name"
            || data.groupBy === "events.search.category.name" || data.groupBy === "events.search.origin.code") {
            groups.push({
                '$group': {
                    "_id": { "event_key": '$' + data.groupBy, "connection_id": "$_id" },
                    "count": { "$sum": 1 }
                }
            });
            groups.push({
                "$group": {
                    "_id": "$_id.event_key",
                    "count": { $sum: "$count" }
                }
            });
        } else {
            if (data.navigateTo || data.eventType) {
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

    analyticsService.expandMatchQuery(data, $match);
    if ((data.groupBy === "events.url" || data.groupBy === "events.search.level.name" || data.groupBy === "events.search.language.name"
        || data.groupBy === "events.search.category.name" || data.groupBy === "events.search.origin.code") || data.navigateTo || data.eventType) {
        aggregate.push($unwind);
    }

    aggregate.push($match);
    groups.forEach(function (g) {
        aggregate.push(g);
    });

    return aggregate;
}

analyticsService.expandMatchQuery = function (data, $match) {
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
}

analyticsService.getConnectionsByGroupKey = function (data) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        var query = analyticsService.getConnectionsByKey(data);
        logger.info("query " + JSON.stringify(query));
        return connectionModel.aggregate(query)
            .allowDiskUse(true)
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

analyticsService.getAnalytics = function (data) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        logger.info("before find is detailed search: " + data.isDetailed);
        var query = data.isDetailed === "true" && data.isFirstRequest === "false" ? analyticsService.getDetailedQuery(data, false) : analyticsService.getCountQuery(data);
        logger.info("query " + JSON.stringify(query));
        return connectionModel.aggregate(query)
            .allowDiskUse(true)
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

analyticsService.getTopTenLinksQuery = function (data) {
    let aggregate = [];
    let groups = [];
    let $unwind = {
        '$unwind': {
            path: '$events',
            preserveNullAndEmptyArrays: false
        }
    }
    let $sort = { $sort: { "count": -1 } };
    let $match = analyticsService.getMatchQuery(data);
    let $limit = { '$limit': 10 };

    groups.push({
        '$group': {
            "_id": { "event_key": '$' + data.groupBy, "connection_id": "$_id" },
            "count": { "$sum": 1 }
        }
    });
    groups.push({
        "$group": {
            "_id": "$_id.event_key",
            "count": { $sum: "$count" }
        }
    });

    analyticsService.expandMatchQuery(data, $match);
    aggregate.push($unwind);
    aggregate.push($match);
    groups.forEach(function (g) {
        aggregate.push(g);
    });
    aggregate.push($sort);
    aggregate.push($limit);

    return aggregate;
}

analyticsService.getTopTenLinks = function (data) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        data.groupBy = "events.url"
        var query = analyticsService.getTopTenLinksQuery(data);
        logger.info("query " + JSON.stringify(query));
        return connectionModel.aggregate(query)
            .allowDiskUse(true)
            .exec(function (err, response) {
                if (!err) {
                    // logger.info("Result: " + JSON.stringify(response));
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

analyticsService.getGroupedAnalytics = function (data) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var connectionModel = db.model("connections", connectionSchema);
        data.groupBy = 'detectRtc.browser.name';
        var browserQuery = analyticsService.getDetailedQuery(data, true);
        data.groupBy = 'countryCode';
        var countryCodeQuery = analyticsService.getDetailedQuery(data, true);
        data.groupBy = 'remoteAddress';
        var remoteAddressQuery = analyticsService.getDetailedQuery(data, true);
        data.groupBy = 'referrer';
        var referrerQuery = analyticsService.getDetailedQuery(data, true);
        data.groupBy = 'userName';
        var usernameQuery = analyticsService.getDetailedQuery(data, true);
        data.groupBy = 'application.code';
        var applicationQuery = analyticsService.getDetailedQuery(data, true);
        var browserResult;
        var countryCodeResult;
        var remoteAddressResult;
        var referrerResult;
        var usernameResult;
        return connectionModel.aggregate(browserQuery)
            .allowDiskUse(true)
            .exec(function (err, response) {
                if (!err) {
                    browserResult = response;
                    return connectionModel.aggregate(countryCodeQuery)
                        .allowDiskUse(true)
                        .exec(function (err, countryCodeResponse) {
                            if (!err) {
                                countryCodeResult = countryCodeResponse;
                                return connectionModel.aggregate(remoteAddressQuery)
                                    .allowDiskUse(true)
                                    .exec(function (err, remoteAddressResponse) {
                                        if (!err) {
                                            remoteAddressResult = remoteAddressResponse;
                                            return connectionModel.aggregate(referrerQuery)
                                                .allowDiskUse(true)
                                                .exec(function (err, referrerResponse) {
                                                    if (!err) {
                                                        referrerResult = referrerResponse;
                                                        return connectionModel.aggregate(usernameQuery)
                                                            .allowDiskUse(true)
                                                            .exec(function (err, usernameResponse) {
                                                                if (!err) {
                                                                    usernameResult = usernameResponse;
                                                                    return connectionModel.aggregate(applicationQuery)
                                                                        .allowDiskUse(true)
                                                                        .exec(function (err, applicationResponse) {
                                                                            if (!err) {
                                                                                var analytics = {
                                                                                    browserResult: browserResult,
                                                                                    countryCodeResult: countryCodeResult,
                                                                                    remoteAddressResult: remoteAddressResult,
                                                                                    referrerResult: referrerResult,
                                                                                    usernameResult: usernameResult,
                                                                                    applicationResult: applicationResponse
                                                                                }
                                                                                resolve(analytics);
                                                                            } else {
                                                                                logger.error("err: " + err);
                                                                                reject(new Error(err));
                                                                            }
                                                                        })
                                                                        .finally(function () {
                                                                            logger.info("Connection closed");
                                                                            db.close();
                                                                        });
                                                                }
                                                                else {
                                                                    logger.error("err: " + err);
                                                                    reject(new Error(err));
                                                                }
                                                            })
                                                    }
                                                    else {
                                                        logger.error("err: " + err);
                                                        reject(new Error(err));
                                                    }
                                                })
                                        } else {
                                            logger.error("err: " + err);
                                            reject(new Error(err));
                                        }
                                    })

                            } else {
                                logger.error("err: " + err);
                                reject(new Error(err));
                            }
                        });
                }
                else {
                    logger.error("err: " + err);
                    reject(new Error(err));
                }
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
        return new Promise(function (resolve, reject) {
            var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
            var connectionModel = db.model("connections", connectionSchema);
            logger.info("Before end date update");
            var endDate = new Date().toISOString();
            return connectionModel.update({ _id: ObjectId(connectionId) }, {
                $set: { endDate: endDate }
            })
                .exec()
                .then(function (result) {
                    logger.info("End date updated: " + result);
                    resolve(result);
                })
                .catch((e)=>{
                    logger.info("Error: " + e);
                    reject(new Error(e));
                })
                .finally(()=>{
                    logger.info("Closing db connection");
                    db.close();
                });
        });
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
                    email: data.email,
                    isAdmin: data.isAdmin
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

analyticsService.getConnectionIds = function (data) {
    var connections = [];
    data.browserResult.forEach(function (browser) {
        connections = browser.data;
    });
    data.countryCodeResult.forEach(function (code) {
        connections = connections.concat(code.data);
    });
    data.remoteAddressResult.forEach(function (address) {
        connections = connections.concat(address.data);
    });

    let item = {};
    connections.forEach(function (connectionId) {
        item[connectionId] = true
    });

    var uniqueIds = Object.keys(item)
    return uniqueIds;
}

analyticsService.getReportObject = function (db, data, topTenLinks, body, isWeekly) {
    var connections = analyticsService.getConnectionIds(data);
    var obj = {
        from: new Date(body.from),
        to: new Date(body.to),
        browserGrouping: data.browserResult,
        countryGrouping: data.countryCodeResult,
        ipGrouping: data.remoteAddressResult,
        referrerGrouping: data.referrerResult,
        usernameGrouping: data.usernameResult,
        applicationGrouping: data.applicationResult,
        navigateToGrouping: topTenLinks,
        connections: connections,
        isWeekly: isWeekly,
        isDaily: !isWeekly
    };

    var reportModel = db.model("reports", reportSchema);
    var report = new reportModel(obj);
    return report;
};

analyticsService.getReportById = function (data) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var reportModel = db.model("reports", reportSchema);
        let query = [];
        let groups = [];
        let $match = { $match: { $and: [{ _id: ObjectId(data.reportId) }, { "connectionReport": { $ne: [] } }] } };
        let $unwind = {
            '$unwind': {
                path: '$connections',
                preserveNullAndEmptyArrays: false
            }
        }
        let $lookup = {
            '$lookup': {
                from: "connections",
                localField: "connections",
                foreignField: "_id",
                as: "connectionReport"
            }
        };
        let $unwindResult = { "$unwind": "$connectionReport" };
        // Group back to arrays
        let $groupArray = {
            "$group":
            {
                "_id": "$connectionReport." + data.grouping,
                "from": { $first: "$from" },
                "to": { $first: "$to" },
                "connections": { "$push": "$connectionReport" },
                "count": { "$sum": 1 }
            }
        }
        let $sort = { $sort: { "count": -1 } };
        query.push($match);
        query.push($unwind);
        query.push($lookup);
        query.push($unwindResult);
        query.push($groupArray);
        query.push($sort);
        logger.info("query " + JSON.stringify(query));
        return reportModel.aggregate(query)
            .allowDiskUse(true)
            .exec(function (err, response) {
                if (!err) {
                    var from = response[0].from;
                    var to = response[0].to;
                    response.forEach(function (item) {
                        delete item.from;
                        delete item.to;
                    })
                    var result = {
                        from: from,
                        to: to,
                        data: response
                    }
                    console.log("Data " + JSON.stringify(result));
                    resolve(result);
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

analyticsService.createReport = function (data, topTenLinks, body, isWeekly) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var report = analyticsService.getReportObject(db, data, topTenLinks, body, isWeekly);
        return report.save(function (err, response) {
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

module.exports = analyticsService;