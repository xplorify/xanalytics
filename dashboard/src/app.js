import { routes } from './routes';
import { globals } from './models/globals';
import { XAnalytics } from 'xplorify.analytics.client/dist/app';

export class App {
  constructor() {

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
    config.map(routes);

    return authenticationservice.getUserInfo()
    .then(function(result){
      
    });

    this.router = router;
  }  
}
