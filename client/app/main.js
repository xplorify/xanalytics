import { globals } from "./models/globals";
import { analyticsApi } from "services/analytics-api";
import { analyticsWs } from "services/analytics-ws";
import { analyticsUtils } from "services/analytics-utils";

window.addEventListener('load', function() {
    analyticsApi.getGlobals(function(err) {
        if (err) {
            console.log(err);
        } else {
            analyticsUtils.detectRtc(function() {
                analyticsApi.createConnection(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (globals.detectRtc.isWebSocketsSupported) {
                            analyticsWs.open(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    var dataObj = {
                                        userName: "Anonymous",
                                        connectionId: globals.connectionId,
                                        referrer: document.referrer,
                                        from: document.referrer,
                                        to: window.location.href,
                                        eventType: "Navigate"
                                    }
                                    analyticsWs.send(dataObj);
                                }
                            });
                        } else {
                            //if web socket is not supported add new event using ajax request and also send message to admin
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