//import {computedFrom} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { authenticationService } from "../../../../services/authentication-service";
import { securityUtils } from "../../../../services/security-utils";
import { security } from "../../../../services/security";
import { routes } from '../../../../urls';
import { enums } from '../../../../enums';
import { globals } from '../../../../globals';

let self;
export class Login {
    static inject() { return [Router]; }

    constructor(router) {
        self = this;
        this.router = router;
    }
    userName = '';
    password = '';
    rememberMe = false;
    
    login() {
        return authenticationService.login(self.userName, self.password)
            .then(function (result) {
                console.log("result: " + JSON.stringify(result));
                if (result && result.success && result.token) {
                    securityUtils.setAccessToken(result.token, self.rememberMe);
                    var dataObj = {
                        userName: self.userName ? self.userName : "Anonymous",
                        referrer: document.referrer,
                        eventType: enums.eventLogs.login,
                        loginType: enums.loginType.local
                    }
                    globals.xAnalytics.send(dataObj);
                    security.setAuthInfo(result);
                }

                return self.router.navigate(routes.urls.dashboard.realTime);
            });
    }
}