import { globals } from "./models/globals";
import { analyticsApi } from "./services/analytics-api";
import { analyticsWs } from "./services/analytics-ws";
import { analyticsUtils } from "./services/analytics-utils";

var self = null;
class XAnalytics {
    constructor(options) {
        console.log("Constructing XAnalytics with options: " + JSON.stringify(options));
        self = this;
        if (options) {
            if (options.getUserInfoUrl !== undefined) {
                globals.getUserInfoUrl = options.getUserInfoUrl;
            }
            if (options.serverUrl) {
                globals.serverUrl = options.serverUrl;
            }
            if (options.application && options.application.code) {
                globals.application.code = options.application.code;
            }
            if (options.application && options.application.url) {
                globals.application.url = options.application.url;
            }
            if (options.onData) {
                globals.onData = options.onData;
            }
        }
        self.init();
    }

    init() {
        console.log("Initializing event handlers...");
        window.addEventListener('load', self.onLoad);
        window.addEventListener('pushstate', self.onUrlChange);
        window.addEventListener('popstate', self.onUrlChange);
        window.addEventListener('hashchange', self.onUrlChange);
        window.addEventListener('unload', self.onUnload, false);
    }

    send(data) {
        console.log("Sending data: " + JSON.stringify(data));
        analyticsWs.send(data, analyticsApi.send);
    }

    onLoad() {
        console.log("On page load...");
        analyticsApi.getGlobals(function (err) {
            analyticsUtils.detectRtc(function () {
                analyticsApi.getUserInfo(function (err) {
                    analyticsApi.createConnection(function (err) {
                        var userName = globals.userName();
                        var dataObj = {
                            userName: userName,
                            connectionId: globals.connection,
                            referrer: document.referrer,
                            to: window.location.href,
                            eventType: "Navigate"
                        }
                        if (globals.detectRtc.isWebSocketsSupported) {
                            analyticsWs.open(function (err) {
                                analyticsWs.send(dataObj, analyticsApi.send);
                            });
                        } else {
                            //if web socket is not supported add new event using ajax request and also send message to admin
                            analyticsApi.send(dataObj, function (err) {
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

    onUrlChange() {
        console.log("On url change...");
        var dataObj = {
            userName: globals.userName(),
            connectionId: globals.connection,
            referrer: document.referrer,
            to: window.location.href,
            eventType: "Navigate"
        }
        analyticsWs.send(dataObj, analyticsApi.send);
    }

    onUnload() {
        console.log("On unload...");
        if (!globals.detectRtc.isWebSocketsSupported) {
            analyticsApi.closeConnection();
        }
    }

    setOnData(onData){
        globals.onData = onData;
    }
}

window.XAnalytics = XAnalytics;

export default XAnalytics;