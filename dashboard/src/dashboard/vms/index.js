import { PLATFORM } from 'aurelia-pal';

export class Index {
    heading = 'Dashboard Real Time';

    configureRouter(config, router) {
        config.map([
            { route: '/', name: 'Real Time', moduleId: PLATFORM.moduleName('./real-time/real-time'), nav: true, title: 'Real Time' },
            { route: '/analytics', name: 'analytics', moduleId: PLATFORM.moduleName('./analytics/analytics'), nav: true, title: 'Analytics' }
        ]);

        this.router = router;
    }
}
