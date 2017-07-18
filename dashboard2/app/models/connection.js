import Event from './event';
import { enums } from './enums';
import { sort } from './sort';

let self;
export class Connection {
  constructor(data) {
    self = this;
    this.events = [];
    this.id = data && data._id ? data._id : null;
    this.prevId = data && data.previousConnectionId ? data.previousConnectionId : null;
    this.countryCode = data && data.countryCode ? data.countryCode : null;
    this.userName = data && data.userName ? data.userName : null;
    this.referrer = data && data.referrer ? data.referrer : null;
    this.remoteAddress = data && data.remoteAddress ? data.remoteAddress : null;
    this.detectRtc = data && data.detectRtc ? data.detectRtc : null;
    this.application = data && data.application ? data.application : null;

    if (data.events && data.events.length) {
      let eventList = [];
      data.events.forEach(function(item) {
        eventList.push(new Event(item));
      });
      self.events = eventList;
    }
  } 
}
