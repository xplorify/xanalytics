import { computedFrom } from 'aurelia-framework';

export default class Event {
    constructor(data) {
        var self = this;
        this.id = ko.observable(data._id ? data._id : null);
        this.eventType = ko.observable(data.eventType ? data.eventType : null);
        this.url = ko.observable(data.url ? data.url : null);
        this.info = ko.observable(data.info ? data.info : null);
        this.date = ko.observable(data.date ? new Date(data.date) : null);

        this.toFormatted = ko.computed();
    }

    @computedFrom('formatTo')
    formatTo() {
        if (self.url()) {
            var to = self.url();
            return to.replace(/[\/:\?=\.]/g, '_');
        }
    }
}