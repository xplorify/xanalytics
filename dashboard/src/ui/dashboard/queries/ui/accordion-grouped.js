import { bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { inject } from 'aurelia-framework';
import { QueryHelper } from './query-helper';


let self;
@inject(Router, QueryHelper)
export class AccordionGrouped {
  @bindable conn;
  @bindable totalCount;
  @bindable filterForm;

  constructor(router, queryHelper) {
    self = this;
    self.router = router;
    self.queryHelper = queryHelper;
  }

  toggleGroup(accordion) {
    self.eventsLength = 0;
    if (!accordion.isActive) {
      //reset lastId on accordion open
      self.filterForm.lastIds.forEach(function (obj) {
        if (obj.key === accordion._id) {
          obj.lastId = "";
        }
      });
      self.filterForm.key = accordion._id;
      self.filterForm.lastId = "";
      return self.queryHelper.searchByKey(accordion, self.filterForm, false)
        .then(function (result) {
          self.getLength(accordion);
          accordion.isActive = !accordion.isActive;
        });
    } else {
      accordion.connections = [];
      accordion.isActive = !accordion.isActive;
    }
  }

  getLength(conn) {
    var events = 0;
    conn.connections.forEach(function (connection) {
      events += connection.events.length;
    });
    return events;
  }

  goToUrl(url) {
    return self.router.navigate(url);
  }

  loadMore(accordion) {
    var lastIdFound = self.filterForm.lastIds.find(function (lastIdObj) {
      return lastIdObj.key == accordion._id;
    });
    self.filterForm.lastId = lastIdFound.lastId;
    self.filterForm.key = lastIdFound.key;
    return self.queryHelper.searchByKey(accordion, self.filterForm, true)
      .then(function (result) {
        self.getLength(accordion);
      });
  }
}
