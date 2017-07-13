"use strict"

var mongoose = require('mongoose');

var analyticsAggregateSchema =
    mongoose.Schema({
        startDate: { type: Date, index: true },
        data: Object,
        topTenLinks: Object,
        isDaily: Boolean,
        isWeekly: Boolean
    });

module.exports = analyticsAggregateSchema;