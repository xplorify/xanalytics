import { bindable } from 'aurelia-framework';

let self;
export class AccordionGrouped {
@bindable conn;
@bindable totalCount;
@bindable filterForm;

  constructor(){
    self = this;
  }

  toggleGroup(accordion) {
    accordion.isActive = !accordion.isActive;
  }

  goToUrl(accordion) {
    var url = accordion.panels[0].title;
    return self.router.navigate(url);
  }
}
