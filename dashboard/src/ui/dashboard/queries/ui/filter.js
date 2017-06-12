import { bindable } from 'aurelia-framework';
import { inject } from 'aurelia-framework';
import { globals } from '../../../../models/globals';
import { enums } from '../../../../models/enums';
import { EventAggregator } from 'aurelia-event-aggregator';
import { FilterChanged } from './filter-changed';

let self = null;
@inject(EventAggregator)
export class Filter {
  @bindable filterForm;
  @bindable connections;

  constructor(eventAggregator) {
    self = this;
    this.groupings = ['userName', 'referrer', 'remoteAddress', 'countryCode', 'events.url',
      'events.search.origin.code', 'events.search.level.id', 'events.search.category.id', 'events.search.language.id',
      'detectRtc.osName', 'detectRtc.browser.name', 'application.code'];
    this.browsers = ['Chrome', 'Firefox', 'Safari', 'Others'];
    this.osNames = ['Windows', 'Android', 'Linux', 'iOS'];
    this.applications = globals.applications;
    this.eventLogs = self.getEventLogs();
    this.eventAggregator = eventAggregator;
    this.isRequesting = false;
  }

  get canSearch() {
    return self.filterForm.from != null && self.filterForm.to != null && !self.isRequesting;
  }

  getEventLogs = function () {
    var eventNames = [];
    for (var property in enums.eventLogs) {
      if (enums.eventLogs.hasOwnProperty(property)) {
        eventNames.push(enums.eventLogs[property]);
      }
    }
    return eventNames;
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
          if (self.filterForm.isDetailed || (!self.filterForm.isDetailed && self.filterForm.groupBy !== "null")) {
            self.connections = result;
            self.onFilterChange();
          } else {
            var count = result && result.length > 0 ? result[0].count : 0;
            self.onFilterChange(count);
          }
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

    if (self.filterForm.browser !== "null") {
      data.browser = self.filterForm.browser;
    }

    if (self.filterForm.operatingSystem !== "null") {
      data.operatingSystem = self.filterForm.operatingSystem;
    }

    if (self.filterForm.eventType !== "null") {
      data.eventType = self.filterForm.eventType;
    }

    if (self.filterForm.application !== "null") {
      data.application = self.filterForm.application;
    }

    if (self.filterForm.pageIndex) {
      data.pageIndex = self.filterForm.pageIndex;
    }

    if (self.filterForm.pageSize) {
      data.pageSize = self.filterForm.pageSize;
    }

    data.isDetailed = self.filterForm.isDetailed;

    return data;
  }

  onFilterChange = function (count) {
    var data = {
      connections: self.connections,
      count: count,
      filter: self.filterForm
    }
    this.eventAggregator.publish(new FilterChanged(data));
  }
}
