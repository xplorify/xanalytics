//import {computedFrom} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { globals } from "../../../../globals";
import { analyticsModel } from "./models/analytics";
import connectionModel from './models/connection';

export class RealTime {
  static inject() { return [Router]; }

  constructor(router) {
    this.router = router;
  }
  self = this;
  applications = globals.applications;
  selectedApplication = null;
  //Getters can't be directly observed, so they must be dirty checked.
  //However, if you tell Aurelia the dependencies, it no longer needs to dirty check the property.
  //To optimize by declaring the properties that this getter is computed from, uncomment the line below
  //as well as the corresponding import above.
  //@computedFrom('firstName', 'lastName')

  activate() {
    globals.xAnalytics.setOnData(Statistics.onData);
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
    var isString = typeof connections === 'string';
    if (isString && connections !== "null") {
      var connection = JSON.parse(connections);
      if (connection.removeConnection) {
        analyticsModel.remove(connection.removeConnection);
      } else {
        var conn = new connectionModel(connection);
        analyticsModel.merge(conn);
      }
    } else {
      _.each(connections, function (connection) {
        var conn = new connectionModel(connection);
        analyticsModel.merge(conn);
      });
    }
  }
}