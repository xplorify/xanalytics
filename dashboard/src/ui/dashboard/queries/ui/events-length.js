export class EventsLengthValueConverter {

  toView(connections) {
    var events = 0;
    connections.forEach(function (connection) {
      events += connection.events.length;
    });
    return events;
  }
}
