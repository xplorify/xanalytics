import { globals } from "./models/globals";
import { analyticsApi } from "./services/analytics-api";
import { analyticsWs } from "./services/analytics-ws";
import { analyticsUtils } from "./services/analytics-utils";

window.addEventListener('load', function() {
    console.log('Getting globals...');
    analyticsApi.getGlobals(function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Detecting RTC...');
            analyticsUtils.detectRtc(function() {
                console.log('Creating connection...');
                analyticsApi.createConnection(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (globals.detectRtc.isWebSocketsSupported) {
                            console.log('Opening WS...');
                            analyticsWs.open(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    var dataObj = {
                                        userName: "Anonymous",
                                        connectionId: globals.connection,
                                        referrer: document.referrer,
                                        from: document.referrer,
                                        to: window.location.href,
                                        eventType: "Navigate"
                                    }
                                    console.log('Sending Navigate event via WS...');
                                    analyticsWs.send(dataObj);
                                }
                            });
                        } else {
                            //if web socket is not supported add new event using ajax request and also send message to admin
                            console.log('Sending Navigate event via AJAX...');
                            analyticsApi.addNewEvent(function(err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    }
                });
            });
        }
    });
});

window.addEventListener('unload', closeConnection, false);

function closeConnection() {
    if (!globals.detectRtc.isWebSocketsSupported) {
        analyticsApi.closeConnection();
    }
}