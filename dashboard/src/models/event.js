import { computedFrom } from 'aurelia-framework';
let self;
export default class Event {
  constructor(data, bindingEngine) {
    self = this;
    self.bindingEngine = bindingEngine;
    self.id = data._id ? data._id : null;
    self.eventType = data.eventType ? data.eventType : null;
    self.url = data.url ? data.url : null;
    self.info = data.info ? data.info : null;
    self.date = data.date ? new Date(data.date) : null;

    if (self.id) {
      let idSubscription = self.bindingEngine.propertyObserver(self.id, 'id')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }
    if (self.eventType) {
      let eventTypeSubscription = self.bindingEngine.propertyObserver(self.eventType, 'eventType')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }
    if (self.url) {
      let urlSubscription = self.bindingEngine.propertyObserver(self.url, 'url')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }
    if (self.info) {
      let infoSubscription = self.bindingEngine.propertyObserver(self.info, 'info')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }
    if (self.date) {
      let dateSubscription = self.bindingEngine.propertyObserver(self.date, 'date')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }
  }  
}
