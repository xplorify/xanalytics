import { Router } from 'aurelia-router';
import { inject } from 'aurelia-framework';
import { enums } from '../models/enums';
import { routes } from '../models/urls';
import { globals } from '../models/globals';
import { storage } from './storage';

let self;
@inject(Router)
export class RouteService {

  constructor(router) {
    self = this;
    this.router = router;
  }

  setRouteVisibility(isAuth) {  
      self.router.navigation.forEach(function (routeItem) {
        if (routeItem.config.name === "dashboard" || routeItem.config.name == "logout") {
          isAuth ? routeItem.config.isVisible = true : routeItem.config.isVisible = false;
        }else{
          isAuth ? routeItem.config.isVisible = false : routeItem.config.isVisible = true;
        }
      });
      self.router.refreshNavigation();
  }  
}

// export let routeService = new RouteService();
