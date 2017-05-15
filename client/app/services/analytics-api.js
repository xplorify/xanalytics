import { globals } from "../models/globals";

var urls = {
    getGlobals: globals.serverUrl + "/api/ip/getGlobals",
    createConnection: globals.serverUrl + "/api/createConnection",
    addNewEvent: globals.serverUrl + "/api/addNewEvent",
    closeConnection: globals.serverUrl + "/api/closeConnection",
    getUserInfoUrl: globals.options.getUserInfoUrl
};
var self = null;

class AnalyticsApi {
    constructor() {
        self = this;
        self.sock = null;
        self.timeInterval = 2000;
        self.wsReopenTimer = null;
        self.wsResendTimer = null;
    }

    getGlobals(next) {
        console.log('Getting globals...');

        var req = new XMLHttpRequest();
        var url = urls.getGlobals;
        req.open("GET", url, true);
        req.send(null);
        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                console.log("result " + result);
                globals.countryCode = result.result.country_code;
                globals.ipAddress = result.result.ip;
                next(null);
            }
        };
        req.onerror = function(err) {
            console.log(err);
            next({ error: true, message: req.responseText });
        };
    }

    getUserInfo(next) {
        console.log('Getting user info...');

        var accessToken = window.sessionStorage["accessToken"] || window.localStorage["accessToken"];
        if (accessToken) {
            var req = new XMLHttpRequest();
            var url = urls.getUserInfoUrl;
            req.open("GET", url, true);
            req.setRequestHeader("Authorization", "Bearer " + accessToken);
            req.send(null);
            req.onreadystatechange = function() {
                if (req.readyState === 4) {
                    try {
                        var result = JSON.parse(req.responseText);
                        console.log("result " + result);
                        globals.userInfo = result;
                    } catch (e) {
                        console.log('Unable to parse UserInfo as JSON');
                    }
                    next(null);
                }
            };
            req.onerror = function() {
                next({ error: true, message: req.responseText });
            };
        } else {
            next();
        }
    }

    createConnection(next) {
        console.log('Creating connection...');

        var req = new XMLHttpRequest();
        var url = urls.createConnection;
        var body = {
            previousConnId: window.sessionStorage["connectionId"],
            userName: "Anonymous",
            referrer: document.referrer,
            eventType: "Navigate",
            countryCode: globals.countryCode,
            ipAddress: globals.ipAddress,
            detectRtc: globals.detectRtc,
            application: globals.application,
            to: window.location.url
        };

        req.open("POST", url, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(body));
        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                globals.connection = result.result._id;
                window.sessionStorage["connectionId"] = globals.connection;
                next(null);
            }
        };
        req.onerror = function(err) {
            console.log(err);
            next({ error: true, message: err });
        };
    }

    addNewEvent(next) {
        console.log('Sending Navigate event via AJAX...');

        var req = new XMLHttpRequest();
        var url = urls.addNewEvent;
        var body = {
            userName: "Anonymous",
            connectionId: globals.connection,
            referrer: document.referrer,
            from: document.referrer,
            to: window.location.href,
            eventType: "Navigate"
        };
        req.open("POST", url, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(body));
        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                next(null);
            }
        };
        req.onerror = function(err) {
            console.log(err);
            next({ error: true, message: err });
        };
    }

    closeConnection(next) {
        console.log('Closing connection via AJAX...');

        var body = { connectionId: globals.connection };
        if (navigator.sendBeacon) {
            navigator.sendBeacon(urls.closeConnection, JSON.stringify(body));
        } else {
            var req = new XMLHttpRequest();
            var url = urls.closeConnection;
            req.open("POST", url, false);
            req.setRequestHeader("Content-Type", "application/json");
            console.log("body: " + body);
            req.send(JSON.stringify(body));
        }
    }
}

export let analyticsApi = new AnalyticsApi();