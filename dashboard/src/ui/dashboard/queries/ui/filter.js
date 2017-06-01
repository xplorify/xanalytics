import { bindable } from 'aurelia-framework';
import { inject } from 'aurelia-framework';
import { globals } from '../../../../models/globals';
import { EventAggregator } from 'aurelia-event-aggregator';
import {FilterChanged} from './filter-changed';

let self = null;
@inject(EventAggregator)
export class Filter {
  @bindable filterForm;
  @bindable connections;

  constructor(eventAggregator) {
    self = this;
    this.groupings = ['userName', 'referrer', 'remoteAddress', 'countryCode', 'events.url'];
    this.eventAggregator = eventAggregator;
    this.isRequesting = false;
  }


  get canSearch() {
    return self.filterForm.from != null && self.filterForm.to != null && !self.isRequesting;
  }

  search = function () {
    self.isRequesting = true;
    self.connections = [];
    var data = self.getData();
    console.log("Entered parameters: " + JSON.stringify(self.filterForm));
    return new Promise(function (resolve, reject) {
      globals.xAnalytics.api.getAnalytics(data, function (result) {
        self.isRequesting = false;
        if (result.error) {
          reject(result.message);
        } else {
          self.connections = result;
          self.onFilterChange();
          resolve(result);
        }
      });
    });
  }

  getData = function () {
    var data = {
      from: new Date(self.filterForm.from).toISOString(),
      to: new Date(self.filterForm.to).toISOString()
    }

    if (self.filterForm.username) {
      data.username = self.filterForm.username;
    }

    if (self.filterForm.referrer) {
      data.referrer = self.filterForm.referrer;
    }

    if (self.filterForm.ipAddress) {
      data.ipAddress = self.filterForm.ipAddress;
    }

    if (self.filterForm.countryCode) {
      data.countryCode = self.filterForm.countryCode;
    }

    if (self.filterForm.navigateTo) {
      data.navigateTo = self.filterForm.navigateTo;
    }

    if (self.filterForm.groupBy !== "null") {
      data.groupBy = self.filterForm.groupBy;
    }

    return data;
  }

  onFilterChange = function () {
    var data = {
      connections: self.connections,
      filter: self.filterForm
    }
    this.eventAggregator.publish(new FilterChanged(data));
  }
}
