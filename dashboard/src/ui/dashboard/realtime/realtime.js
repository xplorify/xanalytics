import { computedFrom } from 'aurelia-framework';
import { globals } from '../../../models/globals';
import { AnalyticsModel } from '../../../models/analytics';
import { Connection } from '../../../models/connection';
import { ApplicationChanged } from './ui/application-changed';
import { inject } from 'aurelia-framework';
import { BindingEngine } from 'aurelia-binding';
import { EventAggregator } from 'aurelia-event-aggregator';

let self;
@inject(BindingEngine, EventAggregator)
export class RealTime {

  constructor(bindingEngine, eventAggregator) {
    self = this;
    this.bindingEngine = bindingEngine;
    this.analyticsModel = new AnalyticsModel(bindingEngine);
    this.selectedApplication = null;
    this.eventAggregator = eventAggregator;

    this.eventAggregator.subscribe(ApplicationChanged, msg => this.onChange(msg));
  }

  applications = globals.applications;
  connectionsChanged = false;

  @computedFrom('getGroupedConnections')
  get getAccordions() {
    let groups = self.getGroupedConnections;
    let result = [];
    groups.forEach(function (item) {
      let accordion = {
        id: item.to,
        title: item.to,
        count: item.connections.length,
        panels: []
      };
      item.connections.forEach(function (connection) {
        let lastNavigateEvent = self.analyticsModel.lastNavigateEvent(connection.conn.events);

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

  @computedFrom('selectedApplication', 'connectionsChanged')
  get getGroupedConnections() {
    self.connectionsChanged = false;
    if (self.selectedApplication && self.selectedApplication.code) {
      return self.analyticsModel.groupByUrlAndCode(self.selectedApplication.code);
    }
    return self.analyticsModel.groupByUrl;
  }

  @computedFrom('selectedApplication', 'connectionsChanged')
  get getConnectionsCount() {
    self.connectionsChanged = false;
    let count = 0;
    self.getGroupedConnections.forEach(function (groupedConnection) {
      count += groupedConnection.connections.length;
    });

    return count;
  }

  activate() {
    globals.xAnalytics.setOnData(self.onData);
    return self.getOpenConnections()
      .then(self.onData);
  }

  getOpenConnections = function (code) {
    return new Promise(function (resolve, reject) {
      globals.xAnalytics.api.getOpenConnections(code, function (result) {
        if (result.error) {
          reject(result.message);
        } else {
          resolve(result);
        }
      });
    });
  }

  onData = function (connections) {
    self.connectionsChanged = true;
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
      if (connections && connections.length > 0) {
        connections.forEach(function (connection) {
          let conn = new Connection(connection, self.bindingEngine);
          self.analyticsModel.merge(conn);
        });
      }else{
        self.analyticsModel.connections = [];
      }
    }
  }

  onChange = function (selectedApplication) {
    if (selectedApplication) {
      self.analyticsModel.connections = [];
      return self.getOpenConnections(selectedApplication.application ? selectedApplication.application.code : '')
        .then(self.onData);
    }
  }
}
