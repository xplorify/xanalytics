import * as _ from 'underscore';
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
      _.each(self.connections, function(item) {
        if (item.lastNavigateEvent && item.lastNavigateEvent.url) {
          lastUrls.push({
            conn: item,
            to: item.lastNavigateEvent.toFormatted
          });
        }
      });

      let grouped = _.groupBy(lastUrls, 'to');

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

  groupByUrlAndCode(code) {
    if (self && self.connections) {
      let lastUrls = [];
      _.each(self.connections, function(item) {
        if (item.lastNavigateEvent && item.application.code === code) {
          lastUrls.push({
            conn: item,
            to: item.lastNavigateEvent.toFormatted
          });
        }
      });

      let grouped = _.groupBy(lastUrls, 'to');

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
    let existing = _.find(self.connections, function(connection) {
      return conn.id === connection.id;
    });

    if (existing) {
      //add missing events
      let mergedEvents = existing.events.concat(conn.events);
      let events = sort.sortEventsByDateAscending(mergedEvents);
      let uniqueEvents = _.uniq(events, function(event) {
        return event.id;
      });
      existing.events = uniqueEvents;
      existing.userName = conn.userName;
      // self.connections.valueHasMutated();
    } else {
      self.connections.push(conn);
    }
  }

  remove(connectionId) {
    self.connections.remove(function(item) {
      return item.id === connectionId;
    });
  }
}
