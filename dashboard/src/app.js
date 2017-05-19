import { PLATFORM } from 'aurelia-pal';
import '../assets/css/w3-version4.css';
import '../assets/css/w3.css';
import { route } from './routes';
import { globals } from '../globals';
import { XAnalytics } from "xplorify.analytics.client/dist/app";

export class App {
  constructor() {
    var options = { application: globals.application, serverUrl: globals.serverUrl, getUserInfoUrl: globals.getUserInfoLocation };
    globals.xAnalytics = new window.XAnalytics(options);
  }

  configureRouter(config, router) {
    config.title = 'Admin Dashboard';
    config.map(route);

    this.router = router;
  }

}
