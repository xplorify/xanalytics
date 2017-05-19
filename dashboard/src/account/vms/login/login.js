//import {computedFrom} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { authenticationService } from "../../../../services/authentication-service";
import { securityUtils } from "../../../../services/security-utils";
import { routes } from '../../../../urls';

export class Login {
     static inject() { return [Router]; }

  constructor(router){
    this.router = router;
  }
    userName = '';
    password = '';
    rememberMe = false;
    //Getters can't be directly observed, so they must be dirty checked.
    //However, if you tell Aurelia the dependencies, it no longer needs to dirty check the property.
    //To optimize by declaring the properties that this getter is computed from, uncomment the line below
    //as well as the corresponding import above.
    //@computedFrom('firstName', 'lastName')
    signIn() {
        var self = this;
        return authenticationService.login(self.userName, self.password)
            .then(function (result) {
                console.log("result: " + JSON.stringify(result));
                if (result && result.success && result.token) {
                    securityUtils.setAccessToken(result.token, self.rememberMe);
                }
                return self.router.navigate(routes.urls.dashboard.realTime);
            });
    }

    canDeactivate() {
    }
}