import { bindable } from 'aurelia-framework';
import { globals } from '../../../../models/globals';

let self = null;
export class Filter {
  @bindable analyticsModel;
  @bindable onChange;

  constructor() {
    self = this;
    this.applications = globals.applications;
  }

  refresh = function() {
    self.analyticsModel.connections = [];
    return self.onChange();
  }
}
