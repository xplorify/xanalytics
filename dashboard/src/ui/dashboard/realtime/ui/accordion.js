import { bindable } from 'aurelia-framework';

export class Accordion {
  @bindable accordion;

  toggle(accordion) {
    accordion.isActive = !accordion.isActive;
  }
}
