import { computedFrom } from 'aurelia-framework';
import { globals } from '../../../models/globals';
import { inject } from 'aurelia-framework';
import { BindingEngine } from 'aurelia-binding';
import { FilterChanged } from './ui/filter-changed';
import { EventAggregator } from 'aurelia-event-aggregator';
import { QueryHelper } from './ui/query-helper';

let self;
@inject(BindingEngine, EventAggregator, QueryHelper)
export class Queries {

  constructor(bindingEngine, eventAggregator, queryHelper) {
    self = this;
    self.filterForm = {
      from: null,
      to: null,
      username: "",
      countryCode: "",
      ipAddress: "",
      referrer: "",
      navigateTo: "",
      groupBy: "",
      browser: "",
      operatingSystem: "",
      application: "",
      eventType: "",
      isDetailed: false,
      pageSize: 10,
      lastId: "",
      lastIds: [],
      key: "",
      isFirstRequest: false
    }

    self.connections = [];
    self.count = null;
    self.isGrouped = false;
    self.totalCount = 0;
    self.eventsLength = 0;
    self.showMore = false;
    self.queryHelper = queryHelper;
    self.eventAggregator = eventAggregator;
    self.eventAggregator.subscribe(FilterChanged, data => self.onFilterChange(data));
  }

  activate() {
    return true;
  }

  onFilterChange(filterResult) {
    self.connections = filterResult.data.isMoreDataRequested ? self.connections.concat(filterResult.data.connections) : filterResult.data.connections;
    self.count = filterResult.data.count;
    self.filterForm = filterResult.data.filter;
    if (filterResult.data.filter.isFirstRequest) {
      self.filterForm.isFirstRequest = false;
      self.totalCount = filterResult.data.count;
    }
    self.isGrouped = self.filterForm.groupBy != "null";
  }

  loadMore() {
    self.filterForm.isFirstRequest = false;
    return self.queryHelper.search(self.filterForm, true)
      .then(function (result) {
        self.getEventsLength(self.connections);
      });
  }

  getEventsLength(conn) {
    var events = 0;
    conn.forEach(function (connection) {
      events += connection.events.length;
    });
    self.eventsLength = events;
  }

  toggle() {
    if (!self.showMore) {
      //reset lastId on accordion open
      self.filterForm.key = "";
      self.filterForm.lastId = "";
      self.filterForm.isFirstRequest = false;
      return self.queryHelper.search(self.filterForm, false)
        .then(function (result) {
          self.showMore = !self.showMore;
          self.getEventsLength(self.connections);
        });
    } else {
      self.connections = [];
      self.showMore = !self.showMore;
      self.filterForm.isFirstRequest = true;
    }
  }

}
