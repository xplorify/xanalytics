import { Routes } from './routes';
import { globals } from './models/globals';
import { XAnalytics } from 'xplorify.analytics.client/dist/app';
import { Router, Redirect } from 'aurelia-router';
import { storage } from 'services/storage';
import { security } from 'services/security';
import { authService } from 'services/auth-service';
import { inject } from 'aurelia-framework';
import { enums } from 'models/enums';
import { route } from 'models/urls';

let objectThis;
@inject(Routes)
export class App {

  constructor(routes) {
    objectThis = this;
    objectThis.routes = routes;
    let options = {
      application: globals.application,
      serverUrl: globals.serverUrl,
      getUserInfoUrl: globals.getUserInfoLocation,
      authSchema: globals.authSchema
    };
    globals.xAnalytics = new window.XAnalytics(options);
    objectThis.isLogginOut = false;
    objectThis.routes.isLogoutVisible = true;
  }

  configureRouter(config, router) {
    config.title = 'Admin Dashboard';
    config.options.pushState = true;

    config.addAuthorizeStep(AuthorizeStep);
    config.map(objectThis.routes.routes);

    this.router = router;
  }

  logout() {
    objectThis.isLogginOut = true;
    objectThis.routes.isLogoutVisible = false;
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
    console.log("Inside logout, isAuth: false");
    self.setRouteVisibility(false);
    return objectThis.router.navigate("/login");
  }

}

let self;
@inject(Router)
export class AuthorizeStep {
  constructor(router) {
    self = this;
    this.router = router;
  }

  async run(navigationInstruction, next) {
    var instructions = navigationInstruction.getAllInstructions().some(function (item) { return item.config.auth; });
    if (instructions) {
      var isAuthorized = await self.isAuthorized();
      if (!isAuthorized) {
        console.log("Inside run, isAuth: " + isAuthorized);
        self.setRouteVisibility(false);
        objectThis.isLogginOut = false;
        return next.cancel(new Redirect('login'));
      }
    }

    self.setRouteVisibility(!objectThis.isLogginOut);
    objectThis.isLogginOut = false;
    return next();
  }

  async isAuthorized() {
    if (objectThis.isLogginOut) {
      return false;
    }
    var accessToken = storage.get('accessToken');
    console.log("accessToken: " + accessToken);
    if (accessToken !== undefined) {
      return authService.getUserInfo()
        .then(function (result) {
          return result && result._id != null;
        });
    } else {
      return false;
    }
  }

  setRouteVisibility(isAuth) {
    self.router.navigation.forEach(function (routeItem) {
      if (routeItem.config.name === "dashboard") {
        routeItem.config.isVisible = isAuth;
        objectThis.routes.isLogoutVisible = isAuth;
        console.log("Setting dasboard route: " + routeItem.config.isVisible);
      } else {
        routeItem.config.isVisible = !isAuth;
        console.log("Setting other routes: " + routeItem.config.isVisible);
      }
    });
  }
}
