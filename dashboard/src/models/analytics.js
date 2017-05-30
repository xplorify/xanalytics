import { observable } from 'aurelia-framework';
import { computedFrom } from 'aurelia-framework';
import { sort } from './sort';
import { enums } from './enums';

let self;
export class AnalyticsModel {

  constructor(bindingEngine) {
    this.connections = [];
    this.bindingEngine = bindingEngine;
    self = this;
    let subscription = self.bindingEngine.collectionObserver(self.connections)
      .subscribe(self.connectionsChanged);
  }

  connectionsChanged(splices) {
      console.log("connections changed: " + splices);
    }

  @computedFrom('connections')
  get groupByUrl() {
    if (self && self.connections && self.connections.length > 0) {
      let lastUrls = [];
      self.connections.forEach(function (item) {
        var lastNavEvent = self.lastNavigateEvent(item.events);
        if (lastNavEvent && lastNavEvent.url) {
          lastUrls.push({
            conn: item,
            to: self.getToFormatted(lastNavEvent.url)
          });
        }
      });

      let grouped = lastUrls && lastUrls.length > 0 ? self.groupBy(lastUrls, 'to') : [];
      let normalized = [];
      for (let p in grouped) {
        normalized.push({
          to: p,
          connections: grouped[p]
        });
      }

      return normalized;
    }

    return [];
  }

  groupBy = function (array, key) {
    var grouped = array.reduce(function (accumulator, currentValue) {
      (accumulator[currentValue[key]] = accumulator[currentValue[key]] || []).push(currentValue);
      return accumulator;
    }, {});

    return grouped;
  };

  getToFormatted(url) {
    if (url) {
      return url.replace(/[\/:\?=\.]/g, '_');
    }
  }

   lastNavigateEvent(events) {
    if (events) {
      var navigateEvents = [];
      events.forEach(function(eventObj) {
        if(eventObj.eventType === enums.eventLogs.navigate && eventObj.url){
          navigateEvents.push(eventObj);
        }
      });
      let lastEvent = sort.sortEventsByDateDescending(navigateEvents)[0];

      return lastEvent;
    }
    return null;
  }

  groupByUrlAndCode(code) {
    if (self && self.connections) {
      let lastUrls = [];
      self.connections.forEach(function (item) {
        var lastNavEvent = self.lastNavigateEvent(item.events);
        if (lastNavEvent && item.application.code === code) {
          lastUrls.push({
            conn: item,
            to: self.getToFormatted(lastNavEvent.url)
          });
        }
      });

      let grouped = self.groupBy(lastUrls, 'to');

      let normalized = [];
      for (let p in grouped) {
        normalized.push({
          to: p,
          connections: grouped[p]
        });
      }

      return normalized;
    }

    return [];
  }

  merge(conn) {
    //find existing connection
    let existing = null;
    self.connections.forEach(function (connection) {
      if (conn.id === connection.id)
        existing = connection;
    });

    if (existing) {
      //add missing events
      let mergedEvents = existing.events.concat(conn.events);
      let events = sort.sortEventsByDateAscending(mergedEvents);
      var uniqueEvents = []
      events.forEach(function (event) {
        var eventFound = false;
        uniqueEvents.forEach(function (uniqueEvent) {
          if (event.id == uniqueEvent.id) {
            eventFound = true;
          }
        });
        if (!eventFound) {
          uniqueEvents.push(event);
        }
      });

      existing.events = uniqueEvents;
      existing.userName = conn.userName;
    } else {
      self.connections.push(conn);
    }
  }

  remove(connectionId) {
    var connection = self.connections.find(function (conn) {
      return conn.id === connectionId;
    });
    let index = self.connections.indexOf(connection);
    if (index !== -1) {
      self.connections.splice(index, 1);
    }
  }
}
