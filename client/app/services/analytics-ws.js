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

        // SockJS.CONNECTING = 0;
        // SockJS.OPEN = 1;
        // SockJS.CLOSING = 2;
        // SockJS.CLOSED = 3;
    }

    open(next) {
        console.log('Opening WS...');

        var sessionId = function () {
            return globals.connection;
        };
        self.sock = new SockJS(urls.ws, null, {
            sessionId: sessionId
        });
        self.sock.onopen = function () {
            console.log("ws opened.");
            if (self.wsReopenTimer) {
                clearInterval(self.wsReopenTimer);
            }
        };
        self.sock.onmessage = function (e) {
            console.log("message", e.data);
        };
        self.sock.onerror = function (e) {
            console.log("ws error: ", e);
        };
        self.sock.onclose = function () {
            console.log("ws closed.");
            if (self.sock.readyState !== 1) {
                self.wsReopenTimer = setInterval(function () {
                    if (self.sock.readyState === 3) {
                        console.log("trying to reopen ws...");
                        self.sock.onopen();
                    }

                }, self.timeInterval);
            }
        };
        next();
    }

    send(dataObj, fallback) {
        console.log('Sending Navigate event via WS...');

        if (self && self.sock && self.sock.readyState === 1) {
            console.log('WS ready...');
            var data = JSON.stringify(dataObj);
            self.sock.send(data);
        } else {
            var numberOfTrials = 10;
            console.log('WS not ready yet...');
            var wsResendTimer = setInterval(function () {
                if (numberOfTrials == 0) {
                    clearInterval(wsResendTimer);
                    console.log("Sending message via WS has failed. Checking if fallback has been provided...");
                    if (fallback) {
                        fallback(dataObj, function (result) {
                            if (result && result.error) {
                                console.log("Error occured during fallback call");
                            }else{
                                
                            }
                        });
                    } else {
                        console.log("No fallback was provided");
                    }
                }

                var data = JSON.stringify(dataObj);
                console.log("Trying to send message: " + data);
                if (self && self.sock && self.sock.readyState === 1) {
                    console.log('WS ready...');
                    self.sock.send(data);
                    clearInterval(wsResendTimer);
                }
                numberOfTrials--;
            }, self.timeInterval);
        }
    }
}

export let analyticsWs = new AnalyticsWs();