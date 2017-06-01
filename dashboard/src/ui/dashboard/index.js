import { routes } from './routes';

export class Index {
  heading = 'Real Time';

  configureRouter(config, router) {
    config.map(routes);
    this.router = router;
  }
}
