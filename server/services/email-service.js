"use strict";

var mongoose = require('mongoose'),
    config = require("../config"),
    emailSchema = require("../models/email"),
    util = require('util'),
    logger = require('winston'),
    sendgrid = require('sendgrid')(config.sendGridKey),
    analyticService = require("./analytics-service"),
    handlebars = require('handlebars'),
    fs = require("fs");
mongoose.Promise = require('bluebird');
var emailService = {};
emailService.Email = mongoose.model("emails", emailSchema);
var ObjectId = mongoose.Types.ObjectId;

emailService.sendAnalytics = function (data, topTenLinks, body, isWeekly) {
    console.log("isWeekly " + isWeekly);
    var reportId;
    return analyticService.createReport(data, topTenLinks, body, isWeekly)
        .then(function (report) {
            reportId = report._id;
            return emailService.createEmail(data, topTenLinks, body, report._id, isWeekly)
        })
        .then(function () {
            return emailService.sendEmail(data, topTenLinks, body, reportId, isWeekly);
        });
}

emailService.createEmail = function (data, topTenLinks, body, reportId, isWeekly) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var email = emailService.getNewEmailObject(db, data, topTenLinks, body, reportId, isWeekly);
        return email.save(function (err, response) {
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

emailService.getNewEmailObject = function (db, data, topTenLinks, body, reportId, isWeekly) {
    var obj = {
        to: "all.inovatika.team@inovatika.net",
        subject: isWeekly ? "Weekly Analytics Report from " + new Date(body.from).toLocaleString() + " to " + body.to : "Daily Analytics Report from " + body.from + " to " + body.to,
        body: emailService.getHtmlContent(data, topTenLinks, reportId)
    };
    var emailModel = db.model("emails", emailSchema);
    var email = new emailModel(obj);
    return email;
};

emailService.sendEmail = function (data, topTenLinks, body, reportId, isWeekly) {
    var msg = isWeekly ? "Sending weekly email via sendgrid ... " : "Sending daily email via sendgrid ... ";
    logger.info(msg);
    var fromHour = new Date(body.from).getUTCHours().toString();
    var fromMin = new Date(body.from).getUTCMinutes().toString();
    var formatedFrom = body.from.slice(0, 10) + " " + (fromHour.length == 1 ? "0" + fromHour : fromHour) + ":" + (fromMin.length == 1 ? "0" + fromMin : fromMin);

    var toHour = new Date(body.to).getUTCHours().toString();
    var toMin = new Date(body.to).getUTCMinutes().toString();
    var formatedTo = body.to.slice(0, 10) + " " + (toHour.length == 1 ? "0" + toHour : toHour) + ":" + (toMin.length == 1 ? "0" + toMin : toMin);

    return new Promise(function (resolve, reject) {
        var request = sendgrid.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: {
                personalizations: [
                    {
                        to: [
                            {
                                email: "all.inovatika.team@inovatika.net"
                            }
                        ],
                        subject: isWeekly ? "Weekly Analytics Report from " + formatedFrom + " to " + formatedTo : "Daily Analytics Report from " + formatedFrom + " to " + formatedTo,
                    }
                ],
                from: {
                    email: 'all@inovatika.com'
                },
                content: [
                    {
                        type: 'text/html',
                        value: emailService.getHtmlContent(data, topTenLinks, reportId)
                    }
                ]
            }
        });

        sendgrid.API(request)
            .then(function (response) {
                resolve(response);
                logger.info("success " + JSON.stringify(response));
            })
            .catch(function (error) {
                // error is an instance of SendGridError
                // The full response is attached to error.response
                logger.error(JSON.stringify(error.response));
                reject(new Error(error));
            });
    });
}

emailService.getHtmlContent = function (data, topTenLinks, reportId) {
    var emailSubject;
    
    if (data.browserResult && data.browserResult.length == 0 && data.countryCodeResult && data.countryCodeResult.length == 0
        && data.remoteAddressResult && data.remoteAddressResult.length == 0 && data.referrerResult
        && data.referrerResult.length == 0 && data.usernameResult && data.usernameResult.length == 0
        && data.applicationResult && data.applicationResult.length == 0 && topTenLinks && topTenLinks.length == 0) {
        console.log("Report is empty");
        const tpl = handlebars.compile(fs.readFileSync(__dirname + '/email.hbs').toString('utf-8'));
        var result = tpl({ isEmpty: true });
        emailSubject = result;
    }

    if (data.browserResult && data.browserResult.length) {
        var url = '<a href="' + config.analyticsUrl + '?r=' + reportId + '&g=browser"' + 'style="padding:15px 32px;text-decoration:none;display:inline-block;font-size:12px;margin:4px 2px;background-color:#42a1f4;color:white">Check browser report</a>'
        const tpl = handlebars.compile(fs.readFileSync(__dirname + '/email.hbs').toString('utf-8'));
        var result = tpl({ data: data.browserResult, url: url, name: "Browser" });
        emailSubject = result;
    }

    if (data.countryCodeResult && data.countryCodeResult.length) {
        var url = '<a href="' + config.analyticsUrl + '?r=' + reportId + '&g=country"' + 'style="padding:15px 32px;text-decoration:none;display:inline-block;font-size:12px;margin:4px 2px;background-color:#42a1f4;color:white">Check country report</a>'
        const tpl = handlebars.compile(fs.readFileSync(__dirname + '/email.hbs').toString('utf-8'));
        var result = tpl({ data: data.countryCodeResult, url: url, name: "Country" });
        emailSubject += result;
    }

    if (data.remoteAddressResult && data.remoteAddressResult.length) {
        var url = '<a href="' + config.analyticsUrl + '?r=' + reportId + '&g=address"' + 'style="padding:15px 32px;text-decoration:none;display:inline-block;font-size:12px;margin:4px 2px;background-color:#42a1f4;color:white">Check IP address report</a>'
        const tpl = handlebars.compile(fs.readFileSync(__dirname + '/email.hbs').toString('utf-8'));
        var result = tpl({ data: data.remoteAddressResult, url: url, name: "Ip Address" });
        emailSubject += result;
    }

    if (data.referrerResult && data.referrerResult.length) {
        var url = '<a href="' + config.analyticsUrl + '?r=' + reportId + '&g=referrer"' + 'style="padding:15px 32px;text-decoration:none;display:inline-block;font-size:12px;margin:4px 2px;background-color:#42a1f4;color:white">Check referrer report</a>'
        const tpl = handlebars.compile(fs.readFileSync(__dirname + '/email.hbs').toString('utf-8'));
        var result = tpl({ data: data.referrerResult, url: url, name: "Referrer" });
        emailSubject += result;
    }

    if (data.usernameResult && data.usernameResult.length) {
        var url = '<a href="' + config.analyticsUrl + '?r=' + reportId + '&g=username"' + 'style="padding:15px 32px;text-decoration:none;display:inline-block;font-size:12px;margin:4px 2px;background-color:#42a1f4;color:white">Check username report</a>'
        const tpl = handlebars.compile(fs.readFileSync(__dirname + '/email.hbs').toString('utf-8'));
        var result = tpl({ data: data.usernameResult, url: url, name: "Username" });
        emailSubject += result;
    }

    if (data.applicationResult && data.applicationResult.length) {
        var url = '<a href="' + config.analyticsUrl + '?r=' + reportId + '&g=application"' + 'style="padding:15px 32px;text-decoration:none;display:inline-block;font-size:12px;margin:4px 2px;background-color:#42a1f4;color:white">Check application report</a>'
        const tpl = handlebars.compile(fs.readFileSync(__dirname + '/email.hbs').toString('utf-8'));
        var result = tpl({ data: data.applicationResult, url: url, name: "Application" });
        emailSubject += result;
    }

    if (topTenLinks) {
        const tpl = handlebars.compile(fs.readFileSync(__dirname + '/email.hbs').toString('utf-8'));
        var result = tpl({ topTenLinks: topTenLinks });
        emailSubject += result;
    }

    return emailSubject;
};

module.exports = emailService;