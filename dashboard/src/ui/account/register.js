import { Router } from 'aurelia-router';
import { authService } from '../../services/auth-service';
import { routes } from '../../models/urls';
import { inject } from 'aurelia-framework';
import { securityUtils } from '../../services/security-utils';
import { security } from '../../services/security';
import { enums } from '../../models/enums';
import { globals } from '../../models/globals';

@inject(Router)
export class Login {
  constructor(router) {
    this.router = router;
  }
  userName = '';
  password = '';
  confirmPassword = '';
  firstName = '';
  lastName = '';
  email = '';
 
  cancel() {
    let self = this;
    self.userName = '';
    self.password = '';
    self.confirmPassword = '';
    self.firstName = '';
    self.lastName = '';
    self.email = '';
  }

  register() {
    let self = this;
    let data = {
      userName: self.userName,
      firstName: self.firstName,
      lastName: self.lastName,
      email: self.email,
      password: self.password
    };
    return authService.register(data)
      .then(function(result) {
        console.log('result: ' + JSON.stringify(result));
       if (result && result.success && result.token) {
          securityUtils.setAccessToken(result.token, self.rememberMe);
          let dataObj = {
            userName: self.userName ? self.userName : 'Anonymous',
            referrer: document.referrer,
            eventType: enums.eventLogs.register,
            loginType: enums.loginType.local
          };
          globals.xAnalytics.send(dataObj);
          security.setAuthInfo(result);
        }
        return self.router.navigate(routes.urls.dashboard.realTime);
      });
  }
}
