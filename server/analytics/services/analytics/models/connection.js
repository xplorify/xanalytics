"use strict"
var mongoose = require('mongoose');
module.exports = {
    connectionSchema: mongoose.Schema({
        previousConnectionId: { type: String, index: true },
        userName: { type: String, index: true },
        startDate: Date,
        endDate: Date,
        referrer: String,
        countryCode: String,
        remoteAddress: String,
        remotePort: Number,
        userAgent: String,
        detectRtc: Object,
        address: {
            ipAddress: String,
            family: String,
            port: Number
        },
        application: {
            code: String,
            url: String
        },
        events: [{
            eventType: String,
            date: Date,
            info: Object
        }]
    })
};