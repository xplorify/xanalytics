import { globals } from "../models/globals";
import SockJS from "sockjs-client";


var self = null;

export default class AnalyticsWs {
    constructor() {
        self = this;
        self.sock = null;
        self.timeInterval = globals.timeInterval;
        self.urls = {
            ws: globals.serverUrl + "/echo"
        };
        // SockJS.CONNECTING = 0;
        // SockJS.OPEN = 1;
        // SockJS.CLOSING = 2;
        // SockJS.CLOSED = 3;
    }

    open(next) {
        console.log('Opening WS...');
        var sessionId = function() {
            return globals.connection;
        };
        self.sock = new SockJS(self.urls.ws, null, {
            sessionId: sessionId
        });
        self.sock.onopen = function() {
            console.log("WS opened.");
            if (self.wsReopenTimer) {
                clearInterval(self.wsReopenTimer);
            }
        };
        self.sock.onmessage = function(e) {
            console.log("Message", e.data);
            if (globals.onData) {
                globals.onData(e.data);
            }
        };
        self.sock.onerror = function(e) {
            console.log("WS error: ", e);
        };
        self.sock.onclose = function() {
            console.log("WS closed.");
            if (self.sock.readyState !== 1) {
                self.wsReopenTimer = setInterval(function() {
                    if (self.sock.readyState === 3) {
                        console.log("Trying to reopen WS...");
                        self.sock.onopen();
                    }

                }, self.timeInterval);
            }
        };
        next();
    }

    send(dataObj, fallback) {
        console.log('Sending Navigate event via WS...');

        if (self && self.sock && self.sock.readyState === 1 && globals.initialized) {
            console.log('WS ready...');
            dataObj.connectionId = globals.connection;
            var data = JSON.stringify(dataObj);
            self.sock.send(data);
        } else {
            var numberOfTrials = globals.numberOfTrials;
            console.log('WS not ready yet...');
            var wsResendTimer = setInterval(function() {
                if (numberOfTrials <= -5){
                    clearInterval(wsResendTimer);
                    console.log("Sending message because connection was not initialized.");
                    return;
                }
                dataObj.connectionId = globals.connection;
                if (numberOfTrials <= 0 && globals.initialized) {
                    clearInterval(wsResendTimer);
                    console.log("Sending message via WS has failed. Checking if fallback has been provided...");
                    if (fallback) {
                        fallback(dataObj, function(result) {
                            if (result && result.error) {
                                console.log("Error occured during fallback call.");
                                return;
                            }
                        });
                    } else {
                        console.log("No fallback was provided.");
                        return;
                    }
                }

                var data = JSON.stringify(dataObj);
                console.log("Trying to send message: " + data);
                if (self && self.sock && self.sock.readyState === 1 && globals.initialized) {
                    console.log('WS ready...');
                    self.sock.send(data);
                    clearInterval(wsResendTimer);
                }
                numberOfTrials--;
            }, self.timeInterval);
        }
    }
}