"use strict"

var mongoose = require('mongoose');

var reportSchema =
    mongoose.Schema({
        from: Date,
        to: Date,
        countryGrouping: Object,
        browserGrouping: Object,
        ipGrouping: Object,
        referrerGrouping: Object,
        usernameGrouping: Object,
        navigateToGrouping: Object,
        applicationGrouping: Object,
        connections: [mongoose.Schema.Types.ObjectId],
        isDaily: Boolean,
        isWeekly: Boolean
    },
        {
            timestamps: true
        });

module.exports = reportSchema;