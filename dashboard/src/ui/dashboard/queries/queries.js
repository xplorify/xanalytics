import { computedFrom } from 'aurelia-framework';
import { globals } from '../../../models/globals';
import { inject } from 'aurelia-framework';
import { BindingEngine } from 'aurelia-binding';

let self;
@inject(BindingEngine)
export class Queries {

  constructor(bindingEngine) {
    self = this;
  }

  activate() {
    return true;
  }
}
