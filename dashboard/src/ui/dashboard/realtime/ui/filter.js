import { bindable } from 'aurelia-framework';
import { inject } from 'aurelia-framework';
import { globals } from '../../../../models/globals';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ApplicationChanged} from './application-changed';

let self = null;
@inject(EventAggregator)
export class Filter {
  @bindable analyticsModel;
  @bindable onChange;
  @bindable getConnectionsCount;
  @bindable selectedApplication;

  constructor(eventAggregator) {
    self = this;
    this.applications = globals.applications;
    this.eventAggregator = eventAggregator;
  }

  refresh = function() {
    self.analyticsModel.connections = [];
    return self.onChange(self.selectedApplication);
  }

  onAppChange = function(){
     this.eventAggregator.publish(new ApplicationChanged(self.selectedApplication));
  }
}
