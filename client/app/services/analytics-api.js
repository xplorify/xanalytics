import { globals } from "../models/globals";


var self = null;

export default class AnalyticsApi {
    constructor() {
        self = this;
        self.sock = null;
        self.timeInterval = 2000;
        self.wsReopenTimer = null;
        self.wsResendTimer = null;
        self.urls = {
            getOpenConnections: globals.serverUrl + "/api/getOpenConnections",
            getAnalytics: globals.serverUrl + "/api/getAnalytics",
            getReportById: globals.serverUrl + "/api/getReportById",
            getConnectionsByGroupKey: globals.serverUrl + "/api/getConnectionsByGroupKey",
            getGlobals: globals.serverUrl + "/api/ip/getGlobals",
            createConnection: globals.serverUrl + "/api/createConnection",
            addNewEvent: globals.serverUrl + "/api/addNewEvent",
            closeConnection: globals.serverUrl + "/api/closeConnection",
            getUserInfoUrl: globals.getUserInfoUrl,
            addUserInfo: globals.serverUrl + "/api/addUserInfo"
        };
    }

    getOpenConnections(code, next) {
        console.log('Getting open connections...');
        var req = new XMLHttpRequest();
        var url = self.urls.getOpenConnections;
        if (code) {
            url = url + "?code=" + code;
        }
        req.open('GET', url, true);
        req.send(null);
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                console.log("Getting open connections was successful.");
                next(result.result);
            }
        };
        req.onerror = function (err) {
            console.log(err);
            next({ error: true, message: req.responseText });
        }
    }

    getAnalytics(options, next) {
        console.log("Getting Analytics..");
        var req = new XMLHttpRequest();
        var url = self.urls.getAnalytics + "?";
        var i = 0;
        for (var prop in options) {
            url = url + (i > 0 ? "&" : "") + prop + "=" + encodeURIComponent(options[prop]);
            i++;
        }
        req.open('GET', url, true);
        req.send(null);
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                console.log("Getting analytics was successful");
                next(result.result);
            }
        };
        req.onerror = function (err) {
            console.log(err);
            next({ error: true, message: req.responseText });
        }
    }

    getReportById(data, next) {
        console.log("Getting Report..");
        var req = new XMLHttpRequest();
        var url = self.urls.getReportById + "?";
        var i = 0;
        for (var prop in data) {
            url = url + (i > 0 ? "&" : "") + prop + "=" + encodeURIComponent(data[prop]);
            i++;
        }
        req.open('GET', url, true);
        req.send(null);
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                console.log("Getting report was successful");
                next(result.result);
            }
        };
        req.onerror = function (err) {
            console.log(err);
            next({ error: true, message: req.responseText });
        }
    }

    getConnectionsByGroupKey(options, next) {
        console.log("Getting Connections By Group Key...");
        var req = new XMLHttpRequest();
        var url = self.urls.getConnectionsByGroupKey + "?";
        var i = 0;
        for (var prop in options) {
            url = url + (i > 0 ? "&" : "") + prop + "=" + encodeURIComponent(options[prop]);
            i++;
        }
        req.open('GET', url, true);
        req.send(null);
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                console.log("Getting connections by group key was successful");
                next(result.result);
            }
        };
        req.onerror = function (err) {
            console.log(err);
            next({ error: true, message: req.responseText });
        }
    }

    getGlobals(next) {
        console.log('Getting globals...');

        var req = new XMLHttpRequest();
        var url = self.urls.getGlobals;
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

        var accessToken = window.sessionStorage[globals.tokenKey] || window.localStorage[globals.tokenKey];
        if (accessToken && self.urls.getUserInfoUrl) {
            var req = new XMLHttpRequest();
            var url = self.urls.getUserInfoUrl;
            req.open("GET", url, true);
            if (!accessToken.startsWith("Bearer") && !accessToken.startsWith("JWT")) {
                accessToken = globals.authSchema + accessToken;
            }
            req.setRequestHeader("Authorization", accessToken);
            req.send(null);
            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    try {
                        var result = JSON.parse(req.responseText);
                        console.log("result " + JSON.stringify(result));
                        globals.userInfo = result;
                        if (result && (result.userName || result.username)) {
                            console.log('Getting user info was successful.');
                            self.addUserInfo(next);
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
        var url = self.urls.addUserInfo;
        var userInfo = globals.userInfo;
        var body = {
            userName: globals.userName(),
            firstName: globals.firstName(),
            lastName: globals.lastName(),
            isAdmin: userInfo && userInfo.roles && userInfo.roles.length > 0 && userInfo.roles[0] === 'admin',
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
        var url = self.urls.createConnection;
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
        var url = self.urls.addNewEvent;
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
        var url = self.urls.closeConnection;
        var body = { connectionId: globals.connection };
        if (navigator.sendBeacon) {
            navigator.sendBeacon(url, JSON.stringify(body));
        } else {
            var req = new XMLHttpRequest();
            req.open("POST", url, false);
            req.setRequestHeader("Content-Type", "application/json");
            console.log("Closing connection via AJAX was successful.");
            req.send(JSON.stringify(body));
        }
    }
}