import { bindable } from 'aurelia-framework';

let self;
export class Accordion {
@bindable connection;

  constructor(){
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
