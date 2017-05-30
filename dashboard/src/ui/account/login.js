import { Router } from 'aurelia-router';
import { authService } from '../../services/auth-service';
import { securityUtils } from '../../services/security-utils';
import { security } from '../../services/security';
import { routes } from '../../models/urls';
import { enums } from '../../models/enums';
import { globals } from '../../models/globals';
import { inject } from 'aurelia-framework';

let self;
@inject(Router)
export class Login {
  constructor(router) {
    self = this;
    this.router = router;
  }
  userName = '';
  password = '';
  rememberMe = false;

  activate() {
    return true;
  }

  login() {
    return authService.login(self.userName, self.password)
      .then(function (result) {
        console.log('result: ' + JSON.stringify(result));
        if (result && result.success && result.token) {
          securityUtils.setAccessToken(result.token, self.rememberMe);
          let dataObj = {
            userName: self.userName ? self.userName : 'Anonymous',
            referrer: document.referrer,
            eventType: enums.eventLogs.login,
            loginType: enums.loginType.local
          };
          globals.xAnalytics.send(dataObj);
          security.setAuthInfo(result);
        }

        return self.router.navigate(routes.urls.dashboard.realTime);
      });
  }

  setRouteVisibility(isAuth) {
    self.router.navigation.forEach(function (routeItem) {
      if (routeItem.config.name === "dashboard") {
        routeItem.config.isVisible = isAuth;
      } else {
        routeItem.config.isVisible = !isAuth;
      }
    });
  }
}
