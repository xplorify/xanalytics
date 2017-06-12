import { bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { inject } from 'aurelia-framework';

let self;
@inject(Router)
export class AccordionPanel {
  @bindable connectionEvent;

  constructor(router){
    this.router = router;
    self = this;
  }

  goToUrl(url) {
    return self.router.navigate(url);
  }
}
