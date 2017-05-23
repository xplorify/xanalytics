import { computedFrom } from 'aurelia-framework';
let self;
export default class Event {
    constructor(data, bindingEngine) {
        self = this;
        this.bindingEngine = bindingEngine;
        this.id = data._id ? data._id : null;
        this.eventType = data.eventType ? data.eventType : null;
        this.url = data.url ? data.url : null;
        this.info = data.info ? data.info : null;
        this.date = data.date ? new Date(data.date) : null;

        if (this.id) {
            let idSubscription = this.bindingEngine.propertyObserver(this.id, 'id')
                .subscribe((newValue, oldValue) => console.log(newValue));
        }
        if (this.eventType) {
            let eventTypeSubscription = this.bindingEngine.propertyObserver(this.eventType, 'eventType')
                .subscribe((newValue, oldValue) => console.log(newValue));
        }
        if (this.url) {
            let urlSubscription = this.bindingEngine.propertyObserver(this.url, 'url')
                .subscribe((newValue, oldValue) => console.log(newValue));
        }
        if (this.info) {
            let infoSubscription = this.bindingEngine.propertyObserver(this.info, 'info')
                .subscribe((newValue, oldValue) => console.log(newValue));
        }
        if (this.date) {
            let dateSubscription = this.bindingEngine.propertyObserver(this.date, 'date')
                .subscribe((newValue, oldValue) => console.log(newValue));
        }
    }

    @computedFrom('url')
    get toFormatted() {
        if (self.url) {
            var to = self.url;
            return to.replace(/[\/:\?=\.]/g, '_');
        }
    }
}