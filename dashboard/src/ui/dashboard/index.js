import { routes } from './routes';

export class Index {
  heading = 'Real Time';

  configureRouter(config, router) {
    // router.baseUrl = "/index"
    config.map(routes);
    this.router = router;
  }
}
