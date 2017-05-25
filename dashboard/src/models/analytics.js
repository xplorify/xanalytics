import { computedFrom } from 'aurelia-framework';
import { sort } from './sort';

let self;
export class AnalyticsModel {

  constructor(bindingEngine) {
    this.connections = [];
    this.bindingEngine = bindingEngine;
    self = this;
    let subscription = this.bindingEngine.collectionObserver(this.connections)
      .subscribe(splices => console.log(splices));
  }

  @computedFrom('connections')
  get groupByUrl() {
    if (self && self.connections) {
      let lastUrls = [];
      self.connections.forEach(function (item) {
        if (item.lastNavigateEvent && item.lastNavigateEvent.url) {
          lastUrls.push({
            conn: item,
            to: item.lastNavigateEvent.toFormatted
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

  groupBy = function (array, key) {
    return array.reduce(function (accumulator, currentValue) {
      (accumulator[currentValue[key]] = accumulator[currentValue[key]] || []).push(currentValue);
      return accumulator;
    }, {});
  };

  groupByUrlAndCode(code) {
    if (self && self.connections) {
      let lastUrls = [];
      self.connections.forEach(function (item) {
        if (item.lastNavigateEvent && item.application.code === code) {
          lastUrls.push({
            conn: item,
            to: item.lastNavigateEvent.toFormatted
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
    self.connections.remove(function (item) {
      return item.id === connectionId;
    });
  }
}
