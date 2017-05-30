import { Router } from 'aurelia-router';
import { inject } from 'aurelia-framework';
import { bindable } from 'aurelia-framework';

let self;
@inject(Router)
export class Accordion {
  @bindable accordion;

  constructor(router){
    this.router = router;
    self = this;
  }

  toggle(accordion) {
    accordion.isActive = !accordion.isActive;
  }

  goToUrl(accordion) {
    var url = accordion.panels[0].title;
    return self.router.navigate(url);
  }
}
