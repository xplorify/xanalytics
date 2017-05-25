import { Router } from 'aurelia-router';
import { authService } from '../../services/auth-service';
import { storage } from '../../services/storage';
import { security } from '../../services/security';
import { routeService } from '../../services/route-service';
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
    security.setRouteVisibility(false);
    return self.router.navigate("/login");
  }

  removeRoute(arr, attr, value) {
    var i = arr.length;
    while (i--) {
      if (arr[i]
        && arr[i].hasOwnProperty(attr)
        && (arguments.length > 2 && arr[i][attr] === value)) {

        arr.splice(i, 1);

      }
    }
    return arr;
  }
}
