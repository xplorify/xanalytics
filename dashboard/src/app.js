import { routes } from './routes';
import { globals } from './models/globals';
import { XAnalytics } from 'xplorify.analytics.client/dist/app';
import { Router, Redirect } from 'aurelia-router';
import { storage } from 'services/storage';
import { RouteService } from 'services/route-service';
import { security } from 'services/security';
import { authService } from 'services/auth-service';
import { inject } from 'aurelia-framework';
import { enums } from 'models/enums';
import { route } from 'models/urls';

let objectThis;
export class App {
  constructor() {
    objectThis = this;
    let options = {
      application: globals.application,
      serverUrl: globals.serverUrl,
      getUserInfoUrl: globals.getUserInfoLocation,
      authSchema: globals.authSchema
    };
    globals.xAnalytics = new window.XAnalytics(options);
  }

  configureRouter(config, router) {
    config.title = 'Admin Dashboard';
    config.options.pushState = true;

    config.addAuthorizeStep(AuthorizeStep);
    config.map(routes);

    this.router = router;
  } 
}

let self;
@inject(Router)
@inject(RouteService)
export class AuthorizeStep {
  constructor(router, routeService) {
    self = this;
    this.router = router;
    this.routeService = routeService;
  }

  async run(navigationInstruction, next) {
    var instructions = navigationInstruction.getAllInstructions().some(function (item) { return item.config.auth; });
    if (instructions) {
      var isAuthorized = await self.isAuthorized();
      if (!isAuthorized) {
        self.routeService.setRouteVisibility(false);
        return next.cancel(new Redirect('login'))
      }
    }
    self.routeService.setRouteVisibility(true);
    return next();
  }

  async isAuthorized() {
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
}
