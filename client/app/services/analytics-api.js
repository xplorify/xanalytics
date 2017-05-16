import { globals } from "../models/globals";

var urls = {
    getGlobals: globals.serverUrl + "/api/ip/getGlobals",
    createConnection: globals.serverUrl + "/api/createConnection",
    addNewEvent: globals.serverUrl + "/api/addNewEvent",
    closeConnection: globals.serverUrl + "/api/closeConnection",
    getUserInfoUrl: globals.getUserInfoUrl,
    addUserInfo: globals.serverUrl + "/api/addUserInfo"
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
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                console.log("result " + result);
                globals.countryCode = result.result.country_code;
                globals.ipAddress = result.result.ip;
                console.log("Getting globals was successful");
                next(null);
            }
        };
        req.onerror = function (err) {
            console.log(err);
            next({ error: true, message: req.responseText });
        };
    }

    getUserInfo(next) {
        console.log('Getting user info...');

        var accessToken = window.sessionStorage["accessToken"] || window.localStorage["accessToken"];
        if (accessToken && urls.getUserInfoUrl) {
            var req = new XMLHttpRequest();
            var url = urls.getUserInfoUrl;
            req.open("GET", url, true);
            req.setRequestHeader("Authorization", "Bearer " + accessToken);
            req.send(null);
            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    try {
                        var result = JSON.parse(req.responseText);
                        console.log("result " + result);
                        globals.userInfo = result;
                        if (result && (result.userName || result.username)) {
                            console.log('Getting user info was successful.');
                            addUserInfo(next);
                            return;
                        }
                    } catch (e) {
                        console.log('Unable to parse UserInfo as JSON');
                    }
                    next(null);
                }
            };
            req.onerror = function () {
                next({ error: true, message: req.responseText });
            };
        } else {
            next();
        }
    }

    addUserInfo(next) {
        console.log('Sending User Info via AJAX...');

        var req = new XMLHttpRequest();
        var url = urls.addUserInfo;
        var userInfo = globals.userInfo;
        var body = {
            userName: globals.userName(),
            firstName: globals.firstName(),
            lastName: globals.lastName(),
            email: userInfo.email,
            connectionId: globals.connection
        };
        req.open("POST", url, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(body));
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                console.log("Sending User Info via AJAX was successful.");
                next(null);
            }
        };
        req.onerror = function (err) {
            console.log(err);
            next({ error: true, message: err });
        };
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
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                globals.connection = result.result._id;
                window.sessionStorage["connectionId"] = globals.connection;
                console.log("Creating connection was successful.");
                next(null);
            }
        };
        req.onerror = function (err) {
            console.log(err);
            next({ error: true, message: err });
        };
    }

    send(data, next) {
        console.log('Sending event via AJAX...');

        var req = new XMLHttpRequest();
        var url = urls.addNewEvent;
        var body = data;
        req.open("POST", url, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(body));
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                console.log("Sending event via AJAX was successful.");
                next(null);
            }
        };
        req.onerror = function (err) {
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
            console.log("Closing connection via AJAX was successful.");
            req.send(JSON.stringify(body));
        }
    }
}

export let analyticsApi = new AnalyticsApi();