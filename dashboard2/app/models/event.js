let self;
export default class Event {
  constructor(data) {
    self = this;
    self.id = data._id ? data._id : null;
    self.eventType = data.eventType ? data.eventType : null;
    self.url = data.url ? data.url : null;
    self.info = data.info ? data.info : null;
    self.search = data.search ? data.search : null;
    self.date = data.date ? new Date(data.date) : null;
  }  
}
