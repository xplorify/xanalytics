import { bindable } from 'aurelia-framework';
import { inject } from 'aurelia-framework';
import { globals } from '../../../../models/globals';
import { enums } from '../../../../models/enums';
import { EventAggregator } from 'aurelia-event-aggregator';
import { FilterChanged } from './filter-changed';

let self = null;
@inject(EventAggregator)
export class QueryHelper {
  constructor(eventAggregator) {
    self = this;
    this.eventAggregator = eventAggregator;
    this.isRequesting = false;
  }

  search = function (filterForm, isMoreDataRequested) {
    self.isRequesting = true;
    self.connections = [];
    var data = self.getData(filterForm);
    console.log("Entered parameters: " + JSON.stringify(filterForm));
    return new Promise(function (resolve, reject) {
      globals.xAnalytics.api.getAnalytics(data, function (result) {
        self.isRequesting = false;
        if (result.error) {
          reject(result.message);
        } else {
          var count;
          if (filterForm.isDetailed || (!filterForm.isDetailed && filterForm.groupBy !== "null")) {
            if (filterForm.groupBy === "null" && filterForm.isFirstRequest) {
              count = result && result.length > 0 ? result[0].count : 0;
            } else {
              self.connections = result;
              filterForm.lastId = result && result.length > 0 ? self.connections[self.connections.length - 1]._id : "";
            }
            self.onFilterChange(filterForm, isMoreDataRequested, count);
          } else {
            var count = result && result.length > 0 ? result[0].count : 0;
            self.onFilterChange(filterForm, isMoreDataRequested, count);
          }
          resolve(result);
        }
      });
    });
  }

  searchByKey = function (group, filterForm, isMoreDataRequested) {
    self.isRequesting = true;
    var data = self.getData(filterForm);
    console.log("Entered parameters: " + JSON.stringify(filterForm));
    return new Promise(function (resolve, reject) {
      globals.xAnalytics.api.getConnectionsByGroupKey(data, function (result) {
        self.isRequesting = false;
        if (result.error) {
          reject(result.message);
        } else {
          group.connections = isMoreDataRequested ? group.connections.concat(result) : result;
          var keyFound = false;
          var lastId = group.connections[group.connections.length - 1]._id;
          filterForm.lastIds.forEach(function (obj) {
            if (obj.key === group._id) {
              keyFound = true;
              obj.lastId = lastId;
            }
          });

          if (!keyFound) {
            filterForm.lastIds.push({ key: group._id, lastId: lastId })
          }
          resolve(result);
        }
      });
    });
  }

  getData = function (filterForm) {
    var data = {
      from: new Date(filterForm.from).toISOString(),
      to: new Date(filterForm.to).toISOString()
    }

    if (filterForm.username) {
      data.username = filterForm.username;
    }

    if (filterForm.referrer) {
      data.referrer = filterForm.referrer;
    }

    if (filterForm.ipAddress) {
      data.ipAddress = filterForm.ipAddress;
    }

    if (filterForm.countryCode) {
      data.countryCode = filterForm.countryCode;
    }

    if (filterForm.navigateTo) {
      data.navigateTo = filterForm.navigateTo;
    }

    if (filterForm.groupBy !== "null") {
      data.groupBy = filterForm.groupBy;
    }

    if (filterForm.browser !== "null") {
      data.browser = filterForm.browser;
    }

    if (filterForm.operatingSystem !== "null") {
      data.operatingSystem = filterForm.operatingSystem;
    }

    if (filterForm.eventType !== "null") {
      data.eventType = filterForm.eventType;
    }

    if (filterForm.application !== "null") {
      data.application = filterForm.application;
    }

    if (filterForm.lastId) {
      data.lastId = filterForm.lastId;
    }

    if (filterForm.key) {
      data.key = filterForm.key;
    }

    if (filterForm.pageSize != "null") {
      data.pageSize = filterForm.pageSize;
    }

    data.isDetailed = filterForm.isDetailed;
    data.isFirstRequest = filterForm.isFirstRequest;

    return data;
  }

  onFilterChange = function (filterForm, isMoreDataRequested, count) {
    var data = {
      connections: self.connections,
      count: count,
      filter: filterForm,
      isMoreDataRequested: isMoreDataRequested
    }
    this.eventAggregator.publish(new FilterChanged(data));
  }
}
