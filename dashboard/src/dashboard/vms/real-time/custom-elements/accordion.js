import {bindable} from 'aurelia-framework';

export class Accordion {
  @bindable accordion;

  // bind() {
  //   if (this.accordion.panels) {
  //     this.accordion.panels.forEach((panel) => {
  //       panel.isActive = false;
  //     });
  //   } else {
  //     throw new Error("Panels are not bound!");
  //   }
  // }

  toggle(accordion){
      accordion.isActive = !accordion.isActive;
  }
}