import { globals } from "../models/globals";

var urls = {
    getGlobals: globals.serverUrl + "/getGlobals",
    createConnection: globals.serverUrl + "/createConnection",
    addNewEvent: globals.serverUrl + "/addNewEvent",
    closeConnection: globals.serverUrl + "/closeConnection"
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
        req.onerror = function() {
            next({ error: true, message: req.responseText });
        };
    }

    createConnection(next) {
        var req = new XMLHttpRequest();
        var url = urls.createConnection;
        var body = {
            previousConnId: window.sessionStorage["connectionId"],
            userName: "Anonymous",
            referrer: document.referrer,
            eventType: "Intro",
            countryCode: globals.countryCode,
            ipAddress: globals.ipAddress,
            detectRtc: globals.detectRtc,
            application: globals.application
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
            // promise.reject(req.responseText);
            next({ error: true, message: err });
        };
    }

    addNewEvent(next) {
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
            next({ error: true, message: err });
        };
    }

    closeConnection(next) {
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