import { globals } from '../globals';
import * as DetectRtc from 'detectrtc/DetectRTC';
import SockJS from "sockjs-client";
import detectRtcModel from '../models/detectRtc';

var urls = {
    getGlobals: globals.serverUrl + '/getGlobals',
    ws: globals.serverUrl + '/echo',
    createConnection: globals.serverUrl + '/createConnection',
    addNewEvent: globals.serverUrl + '/addNewEvent',
    closeConnection: globals.serverUrl + '/closeConnection',
};
var self = null;

class AnalyticsService {

    constructor() {
        self = this;
        self.sock = null;
        self.isResolved = false;
        self.connectionEnded = false;
        self.recInterval = 2000;
    }

    getGlobals(next) {
        var req = new XMLHttpRequest();
        var url = urls.getGlobals;
        req.open('GET', url, true);
        req.send(null);
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                console.log("result " + result);
                globals.countryCode = result.result.country_code;
                globals.ipAddress = result.result.ip;
                next(null);
            }
        };
        req.onerror = function () {
            next({ error: true, message: req.responseText });
        }
    }

    closeConnection(next) {
        var body = { connectionId: globals.connection };
        if (navigator.sendBeacon) {
            navigator.sendBeacon(closeConnection, JSON.stringify(body));
        } else {
            var req = new XMLHttpRequest();
            var url = urls.closeConnection;
            req.open('POST', url, false);
            req.setRequestHeader('Content-Type', 'application/json');
            console.log("body: " + body);
            req.send(JSON.stringify(body));
        }
    }

    detectRtc(next) {
        DetectRtc.load(function () {
            globals.detectRtc = new detectRtcModel(DetectRTC);
            next(null);
        });
    }

    createConnection(next) {
        var req = new XMLHttpRequest();
        var url = urls.createConnection;
        var body = {
            previousConnId: window.sessionStorage['connectionId'],
            userName: "Anonymous",
            referrer: document.referrer,
            eventType: "Intro",
            countryCode: globals.countryCode,
            ipAddress: globals.ipAddress,
            detectRtc: globals.detectRtc,
            application: globals.application
        }

        req.open('POST', url, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify(body));
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                globals.connection = result.result._id;
                window.sessionStorage['connectionId'] = globals.connection;
                next(null);
            }
        };
        req.onerror = function (err) {
            // promise.reject(req.responseText);
            next({ error: true, message: err });
        }
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
        }
        req.open('POST', url, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify(body));
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                var result = JSON.parse(req.responseText);
                next(null);
            }
        };
        req.onerror = function (err) {
            next({ error: true, message: err });
        }
    }

    init(next) {
        var sessionId = function () {
            return globals.connection;
        };
        self.sock = new SockJS(globals.serverUrl + "/echo", null, { sessionId: sessionId });
        self.sock.onopen = function () {
            clearInterval(self.recInterval);
            self.connectionEnded = false;
            console.log('open');
            if (!self.isResolved) {
                self.isResolved = true;
                next(null);
            }
        };
        self.sock.onmessage = function (e) {
            console.log('message', e.data);
        };
        self.sock.onerror = function (e) {
            console.log('ws error', e);
            if (!self.isResolved) {
                self.isResolved = true;
                next({ error: true, message: e });
            }
        };
        self.sock.onclose = function () {
            console.log('close');
            if (!self.connectionEnded && self.sock.readyState != 1) {
                self.recInterval = setInterval(function () {
                    self.sock.onopen();
                }, 2000);
            }
            if (!self.isResolved) {
                self.isResolved = true;
                next(null);
            }
        };
    }

    send(dataObj) {
        if (self && self.sock) {
            var data = JSON.stringify(dataObj);
            self.sock.send(data);
        }
    }
}

export let analyticsService = new AnalyticsService(); 