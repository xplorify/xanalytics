//import {computedFrom} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { authService } from '../../services/auth-service';
import { routes } from '../../models/urls';
import { inject } from 'aurelia-framework';

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
  //Getters can't be directly observed, so they must be dirty checked.
  //However, if you tell Aurelia the dependencies, it no longer needs to dirty check the property.
  //To optimize by declaring the properties that this getter is computed from, uncomment the line below
  //as well as the corresponding import above.
  //@computedFrom('firstName', 'lastName')
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
        // if (result && result.success && result.token) {
        //     securityUtils.setAccessToken(result.token, self.rememberMe);
        // }
        return self.router.navigate(routes.urls.dashboard.realTime);
      });
  }
}
