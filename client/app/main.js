import { globals } from "./models/globals";
import { analyticsApi } from "./services/analytics-api";
import { analyticsWs } from "./services/analytics-ws";
import { analyticsUtils } from "./services/analytics-utils";

var self = null;
class XAnalytics {
    constructor(options) {
        self = this;
        if (options) {
            globals.options = options;
        }
        self.init();
    }

    init() {
        window.addEventListener('load', self.onLoad);
        window.addEventListener('popstate', self.onPopstate);
        window.addEventListener('hashchange', self.onHashChange);
        window.addEventListener('unload', self.onUnload, false);
    }

    onLoad() {
        analyticsApi.getGlobals(function(err) {
            analyticsUtils.detectRtc(function() {
                analyticsApi.getUserInfo(function(err) {
                    analyticsApi.createConnection(function(err) {
                        if (globals.detectRtc.isWebSocketsSupported) {
                            analyticsWs.open(function(err) {
                                var dataObj = {
                                    userName: "Anonymous",
                                    connectionId: globals.connection,
                                    referrer: document.referrer,
                                    to: window.location.href,
                                    eventType: "Navigate"
                                }
                                analyticsWs.send(dataObj);
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
                    });
                })
            });
        });
    }

    onPopstate() {
        var dataObj = {
            userName: "Anonymous",
            connectionId: globals.connection,
            referrer: document.referrer,
            to: window.location.href,
            eventType: "Navigate"
        }
        console.log('Sending Navigate event via WS...');
        analyticsWs.send(dataObj);
    }

    onHashChange() {
        var dataObj = {
            userName: "Anonymous",
            connectionId: globals.connection,
            referrer: document.referrer,
            to: window.location.href,
            eventType: "Navigate"
        }
        console.log('Sending Navigate event via WS...');
        analyticsWs.send(dataObj);
    }

    onUnload() {
        if (!globals.detectRtc.isWebSocketsSupported) {
            analyticsApi.closeConnection();
        }
    }
}

window.XAnalytics = XAnalytics;

export default XAnalytics;