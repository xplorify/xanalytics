import { computedFrom } from 'aurelia-framework';
import Event from './event';
import { enums } from './enums';
import { sort } from './sort';

let self;
export class Connection {
  constructor(data, bindingEngine) {
    self = this;
    this.bindingEngine = bindingEngine;
    this.events = [];
    this.id = data && data._id ? data._id : null;
    this.prevId = data && data.previousConnectionId ? data.previousConnectionId : null;
    this.countryCode = data && data.countryCode ? data.countryCode : null;
    this.userName = data && data.userName ? data.userName : null;
    this.referrer = data && data.referrer ? data.referrer : null;
    this.remoteAddress = data && data.remoteAddress ? data.remoteAddress : null;
    this.detectRtc = data && data.detectRtc ? data.detectRtc : null;
    this.application = data && data.application ? data.application : null;

    let eventsSubscription = this.bindingEngine.collectionObserver(this.events)
      .subscribe(splices => console.log(splices));
    if (this.id) {
      let idSubscription = this.bindingEngine.propertyObserver(this.id, 'id')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }
    if (this.prevId) {
      let prevIdSubscription = this.bindingEngine.propertyObserver(this.prevId, 'prevId')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }
    if (this.countryCode) {
      let countryCodeSubscription = this.bindingEngine.propertyObserver(this.countryCode, 'countryCode')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }
    if (this.userName) {
      let userNameSubscription = this.bindingEngine.propertyObserver(this.userName, 'userName')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }
    if (this.referrer) {
      let referrerSubscription = this.bindingEngine.propertyObserver(this.referrer, 'referrer')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }
    if (this.remoteAddress) {
      let remoteAddressSubscription = this.bindingEngine.propertyObserver(this.remoteAddress, 'remoteAddress')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }
    if (this.detectRtc) {
      let detectRtcSubscription = this.bindingEngine.propertyObserver(this.detectRtc, 'detectRtc')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }
    if (this.application) {
      let applicationSubscription = this.bindingEngine.propertyObserver(this.application, 'application')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }

    if (data.events && data.events.length) {
      let eventList = [];
      data.events.forEach(function(item) {
        eventList.push(new Event(item, self.bindingEngine));
      });
      self.events = eventList;
    }
  }

  @computedFrom('events.url')
  get lastNavigateEvent() {
    if (self && self.events) {
      var navigateEvents = [];
      self.events.forEach(function(eventObj) {
        if(eventObj.eventType === enums.eventLogs.navigate){
          navigateEvents.push(eventObj);
        }
      });
      let lastEvent = sort.sortEventsByDateDescending(navigateEvents)[0];

      return lastEvent;
    }
    return null;
  }
}
