import { Router } from 'aurelia-router';
import { authService } from '../../services/auth-service';
import { storage } from '../../services/storage';
import { security } from '../../services/security';
import { routes } from '../../models/urls';
import { enums } from '../../models/enums';
import { globals } from '../../models/globals';
import { inject } from 'aurelia-framework';

let self;
@inject(Router)
export class Logout {
  constructor(router) {
    self = this;
    this.router = router;
  }

  activate() {
    return true;
  }

  attached() {
    return self.logout();
  }

  logout() {
    console.log("Logging out");
    var dataObj = {
      userName: security.userInfo ? security.userInfo.userName : "Anonymous",
      referrer: document.referrer,
      eventType: enums.eventLogs.logout
    }
    globals.xAnalytics.send(dataObj);
    if (security.userInfo && security.userInfo.accessToken) {
      storage.clear("accessToken");
      security.userInfo = null;
    }
    self.setRouteVisibility(false);
    return self.router.navigate("/");
  }

  setRouteVisibility(isAuth) {
    self.router.navigation.forEach(function (routeItem) {
      if (routeItem.config.name === "dashboard" || routeItem.config.name == "logout") {
        isAuth ? routeItem.config.isVisible = true : routeItem.config.isVisible = false;
      } else {
        isAuth ? routeItem.config.isVisible = false : routeItem.config.isVisible = true;
      }
    });
    // self.router.refreshNavigation();
  }
}
