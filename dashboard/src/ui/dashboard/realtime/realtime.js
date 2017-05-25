import { computedFrom } from 'aurelia-framework';
import { globals } from '../../../models/globals';
import { AnalyticsModel } from '../../../models/analytics';
import { Connection } from '../../../models/connection';
import * as _ from 'underscore';
import { inject } from 'aurelia-framework';
import { BindingEngine } from 'aurelia-binding';

let self;
@inject(BindingEngine)
export class RealTime {

  constructor(bindingEngine) {
    self = this;
    this.bindingEngine = bindingEngine;
    this.analyticsModel = new AnalyticsModel(bindingEngine);
  }

  applications = globals.applications;
  selectedApplication = null;

  @computedFrom('getGroupedConnections')
  get getAccordions() {
    let groups = self.getGroupedConnections;
    let result = [];
    groups.forEach(function(item) {
      let accordion = {
        id: item.to,
        title: item.to,
        count: item.connections.length,
        panels: []
      };
      item.connections.forEach(function(connection) {
        let lastNavigateEvent = connection.conn.lastNavigateEvent;

        accordion.panels.push({
          id: connection.conn.id,
          title: lastNavigateEvent ? lastNavigateEvent.url : 'N/A',
          data: connection.conn
        });
      });
      result.push(accordion);
    });

    return result;
  }

  @computedFrom('selectedApplication')
  get getGroupedConnections() {
    if (self.selectedApplication && self.selectedApplication.code) {
      return self.analyticsModel.groupByUrlAndCode(self.selectedApplication.code);
    }
    return self.analyticsModel.groupByUrl;
  }

  @computedFrom('selectedApplication')
  get getConnectionsCount() {
    let count = 0;
    _.each(self.getGroupedConnections, function(groupedConnection) {
      count += groupedConnection.connections.length;
    });

    return count;
  }


  activate() {
    globals.xAnalytics.setOnData(self.onData);
    return self.getOpenConnections()
      .then(self.onData);
  }

  getOpenConnections = function(code) {
    return new Promise(function(resolve, reject) {
      globals.xAnalytics.api.getOpenConnections(code, function(result) {
        if (result.error) {
          reject(result.message);
        } else {
          resolve(result);
        }
      });
    });
  }

  onData = function(connections) {
    let isString = typeof connections === 'string';
    if (isString && connections !== 'null') {
      let connection = JSON.parse(connections);
      if (connection.removeConnection) {
        self.analyticsModel.remove(connection.removeConnection);
      } else {
        let conn = new Connection(connection, self.bindingEngine);
        self.analyticsModel.merge(conn);
      }
    } else {
      _.each(connections, function(connection) {
        let conn = new Connection(connection, self.bindingEngine);
        self.analyticsModel.merge(conn);
      });
    }
  }

  onChange = function() {
    return self.getOpenConnections(self.selectedApplication ? self.selectedApplication.code : '')
      .then(self.onData);
  }
}
