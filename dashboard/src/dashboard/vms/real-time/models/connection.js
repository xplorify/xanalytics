import { computedFrom } from 'aurelia-framework';
import { observable } from 'aurelia-framework';
import Event from './event';
import DetectRtcModel from './detectRtc';

export default class Connection {
    constructor(data) {
        var self = this;
        this.events = ko.observableArray([]);
       
        this.id = ko.observable(data._id ? data._id : null);
        this.prevId = ko.observable(data.previousConnectionId ? data.previousConnectionId : null);
        this.countryCode = ko.observable(data.countryCode ? data.countryCode : null);
        this.userName = ko.observable(data.userName ? data.userName : null);
        this.referrer = ko.observable(data.referrer ? data.referrer : null);
        this.remoteAddress = ko.observable(data.remoteAddress ? data.remoteAddress : null);
        this.detectRtc = ko.observable(data.detectRtc ? data.detectRtc : null);
        this.application = ko.observable(data.application ? data.application : null);

        if (data.events && data.events.length) {
            var eventList = [];
            _.each(data.events, function (item) {
                eventList.push(new Event(item));
            });
            self.events(eventList);
        }

        this.lastNavigateEvent = ko.computed();
    }

    @computedFrom('getLastNavigateEvent')
    getLastNavigateEvent() {
        if (self && self.events()) {
            var navigateEvents = _.filter(self.events(), function (eventObj) {
                return eventObj.eventType() === enums.eventLogs.navigate;
            });
            var lastEvent = _.first(sort.sortEventsByDateDescending(navigateEvents));

            return lastEvent;
        }
        return null;
    }
}

