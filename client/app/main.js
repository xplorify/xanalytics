import { globals } from "./globals";
import { analyticsService } from "services/analytics-service";

window.addEventListener('load', function () {
    analyticsService.getGlobals(function (err) {
        if (err) {
            console.log(err);
        } else {
            analyticsService.detectRtc(function () {
                analyticsService.createConnection(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (globals.detectRtc.isWebSocketsSupported) {
                            analyticsService.init(function (err) {
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
                                    analyticsService.send(dataObj)
                                }
                            });
                        } else {
                            //if web socket is not supported add new event using ajax request and also send message to admin
                            analyticsService.addNewEvent(function (err) {
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
        analyticsService.closeConnection();
    }
}