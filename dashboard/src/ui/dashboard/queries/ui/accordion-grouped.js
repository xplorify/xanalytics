import { bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { inject } from 'aurelia-framework';


let self;
@inject(Router)
export class AccordionGrouped {
@bindable conn;
@bindable totalCount;
@bindable filterForm;

  constructor(router){
    self = this;
    self.router = router;
  }

  toggleGroup(accordion) {
    accordion.isActive = !accordion.isActive;
  }

  goToUrl(url) {
    return self.router.navigate(url);
  }
}
