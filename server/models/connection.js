"use strict"

var mongoose = require('mongoose');

var connectionShema =
    mongoose.Schema({
        previousConnectionId: { type: String, index: true },
        userName: { type: String, index: true },
        startDate: { type: Date, index: true },
        endDate: { type: Date, index: true },
        countryCode: { type: String, index: true },
        remoteAddress: { type: String, index: true },
        referrer: { type: String, index: true },
        detectRtc: Object,
        application: {
            code: String,
            url: String
        },
        userInfo: {
            firstName: String,
            lastName: String,
            email: String
        },
        events: [{
            eventType: String,
            url: { type: String, index: true },
            date: Date,
            info: Object
        }]
    });

module.exports = connectionShema;