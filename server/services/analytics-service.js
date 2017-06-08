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
                    logger.info("err: " + err);
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
                    logger.info("err: " + err);
                    reject(new Error(err));
                }
            })
            .finally(function () {
                db.close();
            });
    });
};

analyticsService.getOtherBrowsersQuery = function () {
    var query = [
        { "detectRtc.browser.name": { $ne: "Chrome" } },
        { "detectRtc.browser.name": { $ne: "Firefox" } },
        { "detectRtc.browser.name": { $ne: "Safari" } }];
    return query;
}

analyticsService.getDetailedQuery = function (data) {
    var query = data.navigateTo
        ? data.groupBy
            ? data.groupBy === "events.url"
                ? data.browser
                    ? data.browser === "Others"
                        ? data.operatingSystem
                            ? [
                                { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                                {
                                    '$match': {
                                        "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo,
                                        "detectRtc.osName": data.operatingSystem,
                                        "$and": analyticsService.getOtherBrowsersQuery()
                                    },
                                },
                                { '$group': { "_id": { "event_url": '$events.url', "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                                { "$group": { "_id": "$_id.event_url", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                            ]
                            : [
                                { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                                {
                                    '$match': {
                                        "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo,
                                        "$and": analyticsService.getOtherBrowsersQuery()
                                    },
                                },
                                { '$group': { "_id": { "event_url": '$events.url', "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                                { "$group": { "_id": "$_id.event_url", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                            ]
                        : data.operatingSystem
                            ? [
                                { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                                { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.osName": data.operatingSystem, "events.url": data.navigateTo, "detectRtc.browser.name": data.browser } },
                                { '$group': { "_id": { "event_url": '$events.url', "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                                { "$group": { "_id": "$_id.event_url", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                            ]
                            : [
                                { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                                { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo, "detectRtc.browser.name": data.browser } },
                                { '$group': { "_id": { "event_url": '$events.url', "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                                { "$group": { "_id": "$_id.event_url", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                            ]
                    : data.operatingSystem
                        ? [
                            { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                            { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo, "detectRtc.osName": data.operatingSystem } },
                            { '$group': { "_id": { "event_url": '$events.url', "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                            { "$group": { "_id": "$_id.event_url", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                        ]
                        : [
                            { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                            { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo } },
                            { '$group': { "_id": { "event_url": '$events.url', "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                            { "$group": { "_id": "$_id.event_url", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                        ]
                : data.browser
                    ? data.browser === "Others"
                        ? data.operatingSystem
                            ? [
                                { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                                {
                                    '$match': {
                                        "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo,
                                        "detectRtc.osName": data.operatingSystem,
                                        "$and": analyticsService.getOtherBrowsersQuery()
                                    },
                                },
                                { '$group': { "_id": { "group_by": '$' + data.groupBy, "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                                { "$group": { "_id": "$_id.group_by", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                            ]
                            : [
                                { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                                {
                                    '$match': {
                                        "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo,
                                        "$and": analyticsService.getOtherBrowsersQuery()
                                    },
                                },
                                { '$group': { "_id": { "group_by": '$' + data.groupBy, "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                                { "$group": { "_id": "$_id.group_by", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                            ]
                        : data.operatingSystem
                            ? [
                                { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                                { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.osName": data.operatingSystem, "events.url": data.navigateTo, "detectRtc.browser.name": data.browser } },
                                { '$group': { "_id": { "group_by": '$' + data.groupBy, "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                                { "$group": { "_id": "$_id.group_by", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                            ]
                            : [
                                { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                                { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo, "detectRtc.browser.name": data.browser } },
                                { '$group': { "_id": { "group_by": '$' + data.groupBy, "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                                { "$group": { "_id": "$_id.group_by", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                            ]
                    : data.operatingSystem
                        ? [
                            { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                            { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.osName": data.operatingSystem, "events.url": data.navigateTo } },
                            { '$group': { "_id": { "group_by": '$' + data.groupBy, "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                            { "$group": { "_id": "$_id.group_by", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                        ]
                        : [
                            { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                            { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo } },
                            { '$group': { "_id": { "group_by": '$' + data.groupBy, "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                            { "$group": { "_id": "$_id.group_by", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                        ]

            : data.browser
                ? data.browser === "Others"
                    ? data.operatingSystem
                        ? [{ '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                        {
                            '$match': {
                                "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo,
                                "detectRtc.osName": data.operatingSystem,
                                "$and": analyticsService.getOtherBrowsersQuery()
                            },
                        },
                        {
                            '$group': {
                                "_id": "$_id",
                                "userName": { $first: "$userName" },
                                "remoteAddress": { $first: "$remoteAddress" },
                                "referrer": { $first: "$referrer" },
                                "detectRtc": { $first: "$detectRtc" },
                                "countryCode": { $first: "$countryCode" },
                                "events": { $addToSet: "$events" }
                            }
                        }]
                        : [{ '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                        {
                            '$match': {
                                "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo,
                                "$and": analyticsService.getOtherBrowsersQuery()
                            },
                        },
                        {
                            '$group': {
                                "_id": "$_id",
                                "userName": { $first: "$userName" },
                                "remoteAddress": { $first: "$remoteAddress" },
                                "referrer": { $first: "$referrer" },
                                "detectRtc": { $first: "$detectRtc" },
                                "countryCode": { $first: "$countryCode" },
                                "events": { $addToSet: "$events" }
                            }
                        }]
                    : data.operatingSystem
                        ? [{ '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                        { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.osName": data.operatingSystem, "events.url": data.navigateTo, "detectRtc.browser.name": data.browser } },
                        {
                            '$group': {
                                "_id": "$_id",
                                "userName": { $first: "$userName" },
                                "remoteAddress": { $first: "$remoteAddress" },
                                "referrer": { $first: "$referrer" },
                                "detectRtc": { $first: "$detectRtc" },
                                "countryCode": { $first: "$countryCode" },
                                "events": { $addToSet: "$events" }
                            }
                        }]
                        : [{ '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                        { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo, "detectRtc.browser.name": data.browser } },
                        {
                            '$group': {
                                "_id": "$_id",
                                "userName": { $first: "$userName" },
                                "remoteAddress": { $first: "$remoteAddress" },
                                "referrer": { $first: "$referrer" },
                                "detectRtc": { $first: "$detectRtc" },
                                "countryCode": { $first: "$countryCode" },
                                "events": { $addToSet: "$events" }
                            }
                        }]
                : data.operatingSystem
                    ? [{ '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                    { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo, "detectRtc.osName": data.operatingSystem } },
                    {
                        '$group': {
                            "_id": "$_id",
                            "userName": { $first: "$userName" },
                            "remoteAddress": { $first: "$remoteAddress" },
                            "referrer": { $first: "$referrer" },
                            "detectRtc": { $first: "$detectRtc" },
                            "countryCode": { $first: "$countryCode" },
                            "events": { $addToSet: "$events" }
                        }
                    }]
                    : [{ '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                    { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo } },
                    {
                        '$group': {
                            "_id": "$_id",
                            "userName": { $first: "$userName" },
                            "remoteAddress": { $first: "$remoteAddress" },
                            "referrer": { $first: "$referrer" },
                            "detectRtc": { $first: "$detectRtc" },
                            "countryCode": { $first: "$countryCode" },
                            "events": { $addToSet: "$events" }
                        }
                    }]
        : data.groupBy
            ? data.groupBy === "events.url"
                ? data.browser
                    ? data.browser === "Others"
                        ? data.operatingSystem
                            ? [
                                { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                                {
                                    '$match': {
                                        "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) },
                                        "detectRtc.osName": data.operatingSystem,
                                        "$and": analyticsService.getOtherBrowsersQuery()
                                    },
                                },
                                { '$group': { "_id": { "event_url": '$events.url', "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                                { "$group": { "_id": "$_id.event_url", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                            ]
                            : [
                                { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                                {
                                    '$match': {
                                        "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) },
                                        "$and": analyticsService.getOtherBrowsersQuery()
                                    },
                                },
                                { '$group': { "_id": { "event_url": '$events.url', "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                                { "$group": { "_id": "$_id.event_url", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                            ]
                        : data.operatingSystem
                            ? [
                                { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                                { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.osName": data.operatingSystem, "detectRtc.browser.name": data.browser } },
                                { '$group': { "_id": { "event_url": '$events.url', "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                                { "$group": { "_id": "$_id.event_url", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                            ]
                            : [
                                { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                                { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.browser.name": data.browser } },
                                { '$group': { "_id": { "event_url": '$events.url', "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                                { "$group": { "_id": "$_id.event_url", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                            ]
                    : data.operatingSystem
                        ? [
                            { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                            { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.osName": data.operatingSystem } },
                            { '$group': { "_id": { "event_url": '$events.url', "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                            { "$group": { "_id": "$_id.event_url", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                        ]
                        : [
                            { '$unwind': { path: '$events', preserveNullAndEmptyArrays: false } },
                            { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) } } },
                            { '$group': { "_id": { "event_url": '$events.url', "connection_id": "$_id" }, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } },
                            { "$group": { "_id": "$_id.event_url", "data": { $push: { "connections": "$connections", "count": "$count" } }, "count": { $sum: "$count" } } }
                        ]
                : data.browser
                    ? data.browser === "Others"
                        ? data.operatingSystem
                            ? [
                                {
                                    '$match': {
                                        "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) },
                                        "detectRtc.osName": data.operatingSystem,
                                        "$and": analyticsService.getOtherBrowsersQuery()
                                    },
                                },
                                { '$group': { "_id": '$' + data.groupBy, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } }
                            ]
                            : [
                                {
                                    '$match': {
                                        "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) },
                                        "$and": analyticsService.getOtherBrowsersQuery()
                                    },
                                },
                                { '$group': { "_id": '$' + data.groupBy, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } }
                            ]
                        : data.operatingSystem
                            ? [
                                { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.browser.name": data.browser, "detectRtc.osName": data.operatingSystem } },
                                { '$group': { "_id": '$' + data.groupBy, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } }
                            ]
                            : [
                                { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.browser.name": data.browser } },
                                { '$group': { "_id": '$' + data.groupBy, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } }
                            ]
                    : data.operatingSystem
                        ? [
                            { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.osName": data.operatingSystem } },
                            { '$group': { "_id": '$' + data.groupBy, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } }
                        ]
                        : [
                            { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) } } },
                            { '$group': { "_id": '$' + data.groupBy, "connections": { $push: "$$ROOT" }, "count": { "$sum": 1 } } }
                        ]
            : data.browser
                ? data.browser === "Others"
                    ? data.operatingSystem
                        ? {
                            '$match': {
                                "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) },
                                "detectRtc.osName": data.operatingSystem,
                                "$and": analyticsService.getOtherBrowsersQuery()
                            },
                        }
                        : {
                            '$match': {
                                "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) },
                                "$and": analyticsService.getOtherBrowsersQuery()
                            },
                        }
                    : data.operatingSystem
                        ? { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.osName": data.operatingSystem, "detectRtc.browser.name": data.browser } }
                        : { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.browser.name": data.browser } }
                : data.operatingSystem
                    ? { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.osName": data.operatingSystem, } }
                    : { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) } } }

    var queryMatch = analyticsService.getMatchQuery(query);

    if (data.username) {
        queryMatch.userName = data.username;
    }
    if (data.ipAddress) {
        queryMatch.remoteAddress = data.ipAddress;
    }
    if (data.countryCode) {
        queryMatch.countryCode = data.countryCode;
    }
    if (data.referrer) {
        queryMatch.referrer = data.referrer;
    }

    return query;
}

analyticsService.getCountQuery = function (data) {
    var query = data.navigateTo
        ? data.browser
            ? data.browser === "Others"
                ? data.operatingSystem
                    ? [
                        { '$unwind': '$events' },
                        {
                            '$match': {
                                "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo, "detectRtc.osName": data.operatingSystem,
                                "$and": analyticsService.getOtherBrowsersQuery()
                            },
                        },
                        { '$group': { _id: null, count: { $sum: 1 } } }
                    ]
                    : [
                        { '$unwind': '$events' },
                        {
                            '$match': {
                                "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo,
                                "$and": analyticsService.getOtherBrowsersQuery()
                            },
                        },
                        { '$group': { _id: null, count: { $sum: 1 } } }
                    ]
                : data.operatingSystem
                    ? [
                        { '$unwind': '$events' },
                        { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo, "detectRtc.browser.name": data.browser, "detectRtc.osName": data.operatingSystem } },
                        { '$group': { _id: null, count: { $sum: 1 } } }
                    ]
                    : [
                        { '$unwind': '$events' },
                        { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo, "detectRtc.browser.name": data.browser } },
                        { '$group': { _id: null, count: { $sum: 1 } } }
                    ]
            : data.operatingSystem
                ? [
                    { '$unwind': '$events' },
                    { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo, "detectRtc.osName": data.operatingSystem } },
                    { '$group': { _id: null, count: { $sum: 1 } } }
                ]
                : [
                    { '$unwind': '$events' },
                    { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "events.url": data.navigateTo } },
                    { '$group': { _id: null, count: { $sum: 1 } } }
                ]
        : data.browser
            ? data.browser === "Others"
                ? data.operatingSystem
                    ? [
                        {
                            '$match': {
                                "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) },
                                "detectRtc.osName": data.operatingSystem,
                                "$and": analyticsService.getOtherBrowsersQuery()
                            }
                        },
                        { '$group': { _id: null, count: { $sum: 1 } } }
                    ]
                    : [
                        {
                            '$match': {
                                "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) },
                                "$and": analyticsService.getOtherBrowsersQuery()
                            }
                        },
                        { '$group': { _id: null, count: { $sum: 1 } } }
                    ]
                : data.operatingSystem ?
                    [
                        { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.browser.name": data.browser, "detectRtc.osName": data.operatingSystem } },
                        { '$group': { _id: null, count: { $sum: 1 } } }
                    ]
                    : [
                        { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.browser.name": data.browser } },
                        { '$group': { _id: null, count: { $sum: 1 } } }
                    ]
            : data.operatingSystem
                ? [
                    { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) }, "detectRtc.osName": data.operatingSystem } },
                    { '$group': { _id: null, count: { $sum: 1 } } }
                ]
                : [
                    { '$match': { "startDate": { "$gt": new Date(data.from), "$lt": new Date(data.to) } } },
                    { '$group': { _id: null, count: { $sum: 1 } } }
                ]

    var queryMatch = analyticsService.getMatchQuery(query);

    if (data.username) {
        queryMatch.userName = data.username;
    }
    if (data.ipAddress) {
        queryMatch.remoteAddress = data.ipAddress;
    }
    if (data.countryCode) {
        queryMatch.countryCode = data.countryCode;
    }
    if (data.referrer) {
        queryMatch.referrer = data.referrer;
    }

    return query;
}

analyticsService.getMatchQuery = function (query) {
    var queryMatch = null;
    if (Array.isArray(query)) {
        var matchQuery = query.filter(function (obj) {
            logger.info("obj: " + JSON.stringify(obj));
            return obj.$match;
        });

        logger.info("matchQuery: " + JSON.stringify(matchQuery));
        if (matchQuery) {
            queryMatch = matchQuery[0].$match;
        }
    } else {
        queryMatch = query.$match;
    }

    logger.info("query match: " + JSON.stringify(queryMatch));
    return queryMatch;
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
                    logger.info("err: " + err);
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
                    logger.info("err: " + err);
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
                    logger.info("err: " + err);
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
        logger.info("Save failed");
        logger.info("Error: " + e);
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