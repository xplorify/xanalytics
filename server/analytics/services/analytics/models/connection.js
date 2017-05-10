"use strict"
var mongoose = require('mongoose');
module.exports = {
    connectionSchema: mongoose.Schema({
        previousConnectionId: { type: String, index: true },
        userName: { type: String, index: true },
        startDate: Date,
        endDate: Date,
        referrer: String,
        detectRtc: Object,
        application: {
            code: String,
            url: String
        },
        events: [{
            eventType: String,
            date: Date,
            info: Object
        }],
        locations:[{
            countryCode: String,
            ipAddress: String
        }]
    })
};