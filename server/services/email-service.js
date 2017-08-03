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

emailService.sendAnalytics = function (data, topTenLinks, body) {
    var reportId;
    return analyticService.createReport(data, topTenLinks, body)
        .then(function (report) {
            reportId = report._id;
            return emailService.createEmail(data, topTenLinks, body, report._id)
        })
        .then(function () {
            return emailService.sendEmail(data, topTenLinks, body, reportId);
        });
}

emailService.createEmail = function (data, topTenLinks, body, reportId) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var email = emailService.getNewEmailObject(db, data, topTenLinks, body, reportId);
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

emailService.getNewEmailObject = function (db, data, topTenLinks, body, reportId) {
    var obj = {
        to: "all.inovatika.team@inovatika.net",
        subject: topTenLinks ? "Weekly Analytics Report from " + new Date(body.from).toLocaleString() + " to " + body.to : "Daily Analytics Report from " + body.from + " to " + body.to,
        body: emailService.getHtmlContent(data, topTenLinks, reportId)
    };
    var emailModel = db.model("emails", emailSchema);
    var email = new emailModel(obj);
    return email;
};

emailService.sendEmail = function (data, topTenLinks, body, reportId) {
    logger.info("Sending email via sendgrid ... ");
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
                                // email: "all.inovatika.team@inovatika.net"
                                email: "violeta.ivkovska@inovatika.net"
                            }
                        ],
                        subject: topTenLinks ? "Weekly Analytics Report from " + formatedFrom + " to " + formatedTo : "Daily Analytics Report from " + formatedFrom + " to " + formatedTo,
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
    var text = "";
    if (data.browserResult.length === 0 && data.countryCodeResult.length === 0
        && data.remoteAddressResult.length === 0 && (!topTenLinks || (topTenLinks && topTenLinks.length === 0))) {
        text = "No results found";
    } else {
        data.browserResult.forEach(function (browserResult) {
            text += '<table style="border-collapse: collapse; width: 50%;"><tbody><tr><th style="text-align: left; padding: 8px;background-color: #008CBA;color: white;">Browser</th><th style="text-align: left;padding: 8px;background-color: #008CBA;color: white;">Connections</th>'
                + '</tr><tr style="background-color: #f2f2f2">'
                + '<td style="text-align: left;padding: 8px;">' + browserResult._id + '</td>'
                + '<td style="text-align: left; padding: 8px;">' + browserResult.data.length + '</td></tr></tbody></table>'
        });

        text += '<div style="padding-bottom:30px">'
            + '<a href="' + config.analyticsUrl + '?r=' + reportId + '&g=browser" style="padding:15px 32px;text-decoration:none;display:inline-block;font-size:12px;margin:4px 2px;background-color:#42a1f4;color:white">'
            + 'Check Browser Report</a></div>'

        //country code
        data.countryCodeResult.forEach(function (countryCodeResult) {
            text += '<table style="border-collapse: collapse; width: 50%;"><tbody><tr><th style="text-align: left; padding: 8px;background-color: #008CBA;color: white;">Country Code</th><th style="text-align: left;padding: 8px;background-color: #008CBA;color: white;">Connections</th>'
                + '</tr><tr style="background-color: #f2f2f2">'
                + '<td style="text-align: left;padding: 8px;">' + countryCodeResult._id + '</td>'
                + '<td style="text-align: left; padding: 8px;">' + countryCodeResult.data.length + '</td></tr></tbody></table>'
        });

         text += '<div style="padding-bottom:30px">'
            + '<a href="' + config.analyticsUrl + '?r=' + reportId + '&g=country" style="padding:15px 32px;text-decoration:none;display:inline-block;font-size:12px;margin:4px 2px;background-color:#42a1f4;color:white">'
            + 'Check Country Code Report</a></div>'

        //remote address
        data.remoteAddressResult.forEach(function (remoteAddressResult) {
            text += '<table style="border-collapse: collapse; width: 50%;"><tbody><tr><th style="text-align: left; padding: 8px;background-color: #008CBA;color: white;">Country Code</th><th style="text-align: left;padding: 8px;background-color: #008CBA;color: white;">Connections</th>'
                + '</tr><tr style="background-color: #f2f2f2">'
                + '<td style="text-align: left;padding: 8px;">' + remoteAddressResult._id + '</td>'
                + '<td style="text-align: left; padding: 8px;">' + remoteAddressResult.data.length + '</td></tr></tbody></table>'
        });

         text += '<div style="padding-bottom:30px">'
            + '<a href="' + config.analyticsUrl + '?r=' + reportId + '&g=address" style="padding:15px 32px;text-decoration:none;display:inline-block;font-size:12px;margin:4px 2px;background-color:#42a1f4;color:white">'
            + 'Check Ip Address Report</a></div>'

        if (topTenLinks) {
            text += "Top 10 Most Visited Links";
            text += '<table style="border:1px solid black">'
                + '<tbody><tr>'
                + '<th style="border:1px solid black">Link</th>'
                + '<th style="border:1px solid black">Number of visitations</th></tr>'


            topTenLinks.forEach(function (link) {
                text += '<tr style="border:1px solid black">'
                    + '<td style="border:1px solid black">' + link._id + '</td>'
                    + '<td style="border:1px solid black">' + link.count + '</td>'
                    + '</tr>'
            });

            text += '</tbody></table>';
        }
    }
    return text;


    // browserUrl = config.analyticsUrl + "?r=" + reportId + "&g=browser";
    // const tpl = handlebars.compile(fs.readFileSync(__dirname + '/accordion.hbs').toString('utf-8'));
    // var result = tpl({browserResult : data.browserResult && data.browserResult.length > 0 ? data.browserResult : null, 
    //     countryCodeResult : data.countryCodeResult && data.countryCodeResult.length > 0 ? data.countryCodeResult : null,
    //     remoteAddressResult : data.remoteAddressResult && data.remoteAddressResult.length > 0 ? data.remoteAddressResult : null,
    //     browserUrl:  data.browserResult && data.browserResult.length > 0 ? browserUrl : null });
    // return result;
};

module.exports = emailService;