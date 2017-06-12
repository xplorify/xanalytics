import { bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { inject } from 'aurelia-framework';

let self;
@inject(Router)
export class Accordion {
  @bindable connection;
  @bindable count;
  @bindable filterForm;

  constructor(router) {
    self = this;
    self.router = router;
  }

  toggle(accordion) {
    accordion.isActive = !accordion.isActive;
  }

  goToUrl(url) {
    return self.router.navigate(url);
  }
}
