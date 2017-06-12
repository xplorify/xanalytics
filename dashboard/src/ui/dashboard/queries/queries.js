import { computedFrom } from 'aurelia-framework';
import { globals } from '../../../models/globals';
import { inject } from 'aurelia-framework';
import { BindingEngine } from 'aurelia-binding';
import { FilterChanged } from './ui/filter-changed';
import { EventAggregator } from 'aurelia-event-aggregator';

let self;
@inject(BindingEngine, EventAggregator)
export class Queries {

  constructor(bindingEngine, eventAggregator) {
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
      pageIndex: 0
    }

    self.connections = [];
    self.count = null;
    self.isGrouped = false;
    self.eventAggregator = eventAggregator;
    self.eventAggregator.subscribe(FilterChanged, data => self.onFilterChange(data));
  }

  activate() {
    return true;
  }

  onFilterChange(filterResult) {
    self.connections = filterResult.data.connections;
    self.count = filterResult.data.count;
    self.filterForm = filterResult.data.filter;
    self.isGrouped = self.filterForm.groupBy != "null";
  }
}
