"use strict"

var mongoose = require('mongoose');

var emailSchema =
    mongoose.Schema({
        cc:  String,
        to: { type: String, index: true },
        subject: String,
        body: String,
        messageStatus: String
    });

module.exports = emailSchema;