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
                        analyticsService.init(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                var dataObj = {
                                    userName: "Anonymous",
                                    connectionId: globals.connectionId,
                                    referrer: document.referrer,
                                    from: document.referrer,
                                    to: window.location,
                                    eventType: "Navigate"
                                }
                                analyticsService.send(dataObj)
                            }
                        });
                    }
                });
            });
        }
    });
});