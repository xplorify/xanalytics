import { globals } from "../models/globals";
import SockJS from "sockjs-client";

var urls = {
    ws: globals.serverUrl + "/echo"
};
var self = null;

class AnalyticsWs {
    constructor() {
        self = this;
        self.sock = null;
        self.timeInterval = 2000;
        self.wsReopenTimer = null;
    }

    open(next) {
        var sessionId = function() {
            return globals.connection;
        };
        self.sock = new SockJS(urls.ws, null, {
            sessionId: sessionId
        });
        self.sock.onopen = function() {
            console.log("ws opened.");
            if (self.wsReopenTimer) {
                clearInterval(self.wsReopenTimer);
            }
        };
        self.sock.onmessage = function(e) {
            console.log("message", e.data);
        };
        self.sock.onerror = function(e) {
            console.log("ws error: ", e);
        };
        self.sock.onclose = function() {
            console.log("ws closed.");
            if (self.sock.readyState !== 1) {
                self.wsReopenTimer = setInterval(function() {
                    console.log("trying to reopen ws...");
                    self.sock.onopen();
                }, self.timeInterval);
            }
        };
        next();
    }

    send(dataObj) {
        if (self && self.sock && self.sock.readyState === 1) {
            console.log('WS ready...');
            var data = JSON.stringify(dataObj);
            self.sock.send(data);
        } else {
            console.log('WS not ready yet...');
            var wsResendTimer = setInterval(function() {
                var data = JSON.stringify(dataObj);
                console.log("trying to send message: " + data);
                if (self && self.sock && self.sock.readyState === 1) {
                    console.log('WS ready...');
                    self.sock.send(data);
                    clearInterval(wsResendTimer);
                }
            }, self.timeInterval);
        }
    }
}

export let analyticsWs = new AnalyticsWs();