import * as DetectRtc from "detectrtc/DetectRTC";
import DetectRtcModel from "../models/detect-rtc";
import { globals } from "../models/globals";

var self = null;
class AnalyticsUtils {
    constructor() {
        self = this;
    }

    detectRtc(next) {
        console.log('Detecting RTC...');

        DetectRtc.load(function() {
            globals.detectRtc = new DetectRtcModel(DetectRTC);
            next(null);
        });
    }
}

export let analyticsUtils = new AnalyticsUtils();