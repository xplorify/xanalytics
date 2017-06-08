import { globals } from "./models/globals";
import AnalyticsApi from "./services/analytics-api";
import AnalyticsWs from "./services/analytics-ws";
import AnalyticsUtils from "./services/analytics-utils";


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
            if (options.timeInterval) {
                globals.timeInterval = options.timeInterval;
            }
            if (options.numberOfTrials) {
                globals.numberOfTrials = options.numberOfTrials;
            }
            if (options.onData) {
                globals.onData = options.onData;
            }
            if (options.authSchema) {
                globals.authSchema = options.authSchema;
            }
        }

        // first update globals based on options, then instantiate API/WS
        self.api = new AnalyticsApi();
        self.ws = new AnalyticsWs();
        self.utils = new AnalyticsUtils();

        self.init();
    }

    init() {
        console.log("Initializing event handlers...");
        window.addEventListener('load', self.onLoad);
        window.addEventListener('popstate', self.onUrlChange);
        window.addEventListener('hashchange', self.onUrlChange);
        window.addEventListener('unload', self.onUnload, false);

        var pushState = history.pushState;
        history.pushState = function() {
            pushState.apply(history, arguments);
            // fireEvents('pushState', arguments);  // Some event-handling function
            console.log("Inside push state: " + window.location.href);
            self.onUrlChange();
        };
    }

    send(data) {
        var accessToken = window.sessionStorage["accessToken"] || window.localStorage["accessToken"];
        if (accessToken && globals.authToken != accessToken) {
            self.api.getUserInfo(function() {
                globals.authToken = accessToken;
                console.log("Sending data: " + JSON.stringify(data));
                self.ws.send(data, self.api.send);
            });
        } else {
            console.log("Sending data: " + JSON.stringify(data));
            self.ws.send(data, self.api.send);
        }
    }

    onLoad() {
        console.log("On page load...");
        self.api.getGlobals(function(err) {
            if (!err) {
                self.utils.detectRtc(function() {
                    self.api.createConnection(function(err) {
                        if (!err) {
                            var dataObj = {
                                referrer: document.referrer,
                                to: window.location.href,
                                eventType: "Navigate"
                            }
                            self.ws.open(function(err) {
                                self.send(dataObj);
                            });
                            globals.initialized = true;
                        }
                    });
                });
            }
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
        self.ws.send(dataObj, self.api.send);
    }

    onUnload() {
        console.log("On unload...");
        if (!globals.detectRtc.isWebSocketsSupported) {
            self.api.closeConnection();
        }
    }

    setOnData(onData) {
        globals.onData = onData;
    }
}

window.XAnalytics = XAnalytics;

export default XAnalytics;