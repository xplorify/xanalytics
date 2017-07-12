"use strict";

var mongoose = require('mongoose'),
    config = require("../config"),
    emailSchema = require("../models/email"),
    util = require('util'),
    logger = require('winston'),
    // sendgrid = require('sendgrid')("apikey", "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");
    sendgrid = require('sendgrid')("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");
mongoose.Promise = require('bluebird');
var emailService = {};
emailService.Email = mongoose.model("emails", emailSchema);
var ObjectId = mongoose.Types.ObjectId;

emailService.sendAnalytics = function (data, topTenLinks) {
    return emailService.createEmail(data, topTenLinks)
        .then(function () {
            return emailService.sendEmail(data, topTenLinks);
        });
}

emailService.createEmail = function (data, topTenLinks) {
    return new Promise(function (resolve, reject) {
        var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
        var email = emailService.getNewEmailObject(db, data, topTenLinks);
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

emailService.getNewEmailObject = function (db, data, topTenLinks) {
    var obj = {
        to: "all.inovatika.team@inovatika.net",
        subject: "Daily Analytics Report " + new Date(),
        body: emailService.getHtmlContent(data, topTenLinks)
    };
    var emailModel = db.model("emails", emailSchema);
    var email = new emailModel(obj);
    return email;
};

emailService.sendEmail = function (data, topTenLinks) {
    logger.info("Sending email via sendgrid ... ");
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
                        subject: 'Sending with SendGrid is Fun'
                    }
                ],
                from: {
                    email: 'all@inovatika.com'
                },
                content: [
                    {
                        type: 'text/html',
                        value: emailService.getHtmlContent(data, topTenLinks)
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

emailService.getHtmlContent = function (data, topTenLinks) {
    var text = "";
    data.browserResult.forEach(function (browserResult) {
        text += '<table style="border:1px solid black">'
            + '<tbody><tr>'
            + '<th style="border:1px solid black">Browser</th>'
            + '<th style="border:1px solid black">Connections</th></tr>'
            + '<tr style="border:1px solid black">'
            + '<td style="border:1px solid black">' + browserResult._id + '</td>'
            + '<td style="border:1px solid black">' + browserResult.data.length + '</td>'
            + '</tr></tbody></table>';
        text = text + '<table style="border:1px solid black">'
            + '<tbody><tr>'
            + '<th style="border:1px solid black">Username</th>'
            + '<th style="border:1px solid black">Ip address</th>'
            + '<th style="border:1px solid black">Country code</th>'
            + ' <th style="border:1px solid black">Has Speakers</th>'
            + ' <th style="border:1px solid black">Has Microphone</th>'
            + '<th style="border:1px solid black">Has Camera</th></tr>';
        browserResult.data.forEach(function (browserData) {
            text = text + '<tr style="border:1px solid black">'
                + '<td style="border:1px solid black">' + browserData.userName + '</td>'
                + '<td style="border:1px solid black">' + browserData.remoteAddress + '</td>'
                + '<td style="border:1px solid black">' + browserData.countryCode + '</td>'
                + '<td style="border:1px solid black">' + browserData.detectRtc.hasSpeakers + '</td>'
                + '<td style="border:1px solid black">' + browserData.detectRtc.hasMicrophone + '</td>'
                + '<td style="border:1px solid black">' + browserData.detectRtc.hasWebcam + '</td>'
                + '</tr>'
        });
    });

    text += '</tbody></table>'

    //country code
    data.countryCodeResult.forEach(function (countryCodeResult) {
        text += '<table style="border:1px solid black">'
            + '<tbody><tr>'
            + '<th style="border:1px solid black">Country Code</th>'
            + '<th style="border:1px solid black">Connections</th></tr>'
            + '<tr style="border:1px solid black">'
            + '<td style="border:1px solid black">' + countryCodeResult._id + '</td>'
            + '<td style="border:1px solid black">' + countryCodeResult.data.length + '</td>'
            + '</tr></tbody></table>';
        text = text + '<table style="border:1px solid black">'
            + '<tbody><tr>'
            + '<th style="border:1px solid black">Username</th>'
            + '<th style="border:1px solid black">Ip address</th>'
            + '<th style="border:1px solid black">Browser</th>'
            + ' <th style="border:1px solid black">Has Speakers</th>'
            + ' <th style="border:1px solid black">Has Microphone</th>'
            + '<th style="border:1px solid black">Has Camera</th></tr>';
        countryCodeResult.data.forEach(function (countryCodeData) {
            text = text + '<tr style="border:1px solid black">'
                + '<td style="border:1px solid black">' + countryCodeData.userName + '</td>'
                + '<td style="border:1px solid black">' + countryCodeData.remoteAddress + '</td>'
                + '<td style="border:1px solid black">' + countryCodeData.detectRtc.browser.name + '</td>'
                + '<td style="border:1px solid black">' + countryCodeData.detectRtc.hasSpeakers + '</td>'
                + '<td style="border:1px solid black">' + countryCodeData.detectRtc.hasMicrophone + '</td>'
                + '<td style="border:1px solid black">' + countryCodeData.detectRtc.hasWebcam + '</td>'
                + '</tr>'
        });
    });

    text += '</tbody></table>'

    //remote address
    data.remoteAddressResult.forEach(function (remoteAddressResult) {
        text += '<table style="border:1px solid black">'
            + '<tbody><tr>'
            + '<th style="border:1px solid black">Ip Address</th>'
            + '<th style="border:1px solid black">Connections</th></tr>'
            + '<tr style="border:1px solid black">'
            + '<td style="border:1px solid black">' + remoteAddressResult._id + '</td>'
            + '<td style="border:1px solid black">' + remoteAddressResult.data.length + '</td>'
            + '</tr></tbody></table>';
        text = text + '<table style="border:1px solid black">'
            + '<tbody><tr>'
            + '<th style="border:1px solid black">Username</th>'
            + '<th style="border:1px solid black">Country Code</th>'
            + '<th style="border:1px solid black">Browser</th>'
            + ' <th style="border:1px solid black">Has Speakers</th>'
            + ' <th style="border:1px solid black">Has Microphone</th>'
            + '<th style="border:1px solid black">Has Camera</th></tr>';
        remoteAddressResult.data.forEach(function (remoteAddressData) {
            text = text + '<tr style="border:1px solid black">'
                + '<td style="border:1px solid black">' + remoteAddressData.userName + '</td>'
                + '<td style="border:1px solid black">' + remoteAddressData.countryCode + '</td>'
                + '<td style="border:1px solid black">' + remoteAddressData.detectRtc.browser.name + '</td>'
                + '<td style="border:1px solid black">' + remoteAddressData.detectRtc.hasSpeakers + '</td>'
                + '<td style="border:1px solid black">' + remoteAddressData.detectRtc.hasMicrophone + '</td>'
                + '<td style="border:1px solid black">' + remoteAddressData.detectRtc.hasWebcam + '</td>'
                + '</tr>'
        });
    });

    text += '</tbody></table>'
    
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

    return text;
};

module.exports = emailService;