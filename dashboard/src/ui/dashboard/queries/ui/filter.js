import { bindable } from 'aurelia-framework';
import { inject } from 'aurelia-framework';
import { globals } from '../../../../models/globals';
import { enums } from '../../../../models/enums';
import { EventAggregator } from 'aurelia-event-aggregator';
import { FilterChanged } from './filter-changed';
import { QueryHelper } from './query-helper';

let self = null;
@inject(EventAggregator, QueryHelper)
export class Filter {
  @bindable filterForm;
  @bindable connections;

  constructor(eventAggregator, queryHelper) {
    self = this;
    this.groupings = ['userName', 'referrer', 'remoteAddress', 'countryCode', 'events.url',
      'events.search.origin.code', 'events.search.level.name', 'events.search.category.name', 'events.search.language.name',
      'detectRtc.osName', 'detectRtc.browser.name', 'application.code'];
    this.browsers = ['Chrome', 'Firefox', 'Safari', 'Others'];
    this.osNames = ['Windows', 'Android', 'Linux', 'iOS'];
    this.applications = globals.applications;
    this.eventLogs = self.getEventLogs();
    this.eventAggregator = eventAggregator;
    this.isRequesting = false;
    this.pageSizeChoices = [5, 10, 20, 50, 100];
    this.pageSize = 10;
    this.queryHelper = queryHelper;
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
    if (self.pageSize != self.filterForm.pageSize) {
      self.filterForm.pageSize = self.pageSize;
    }

    if (self.filterForm.isDetailed && self.filterForm.groupBy === "null") {
      self.filterForm.isFirstRequest = true;
    }

    self.filterForm.lastId = "";
    return self.queryHelper.search(self.filterForm, false);
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
