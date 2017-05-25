import { PLATFORM } from 'aurelia-pal';
import '../assets/css/w3-version4.css';
import '../assets/css/accordionStyles.css';
import '../assets/css/w3.css';
import { route } from './routes';
import { globals } from '../globals';
import { XAnalytics } from "xplorify.analytics.client/dist/app";

export class App {
  constructor() {
    var options = { application: globals.application, serverUrl: globals.serverUrl, getUserInfoUrl: globals.getUserInfoLocation, authSchema: globals.authSchema };
    globals.xAnalytics = new window.XAnalytics(options);
  }

  configureRouter(config, router) {
    config.title = 'Admin Dashboard';
    config.options.pushState = true;
    config.map(route);

    return authenticationservice.getUserInfo()
    .then(function(result){
      
    })

    this.router = router;
  }  
}
