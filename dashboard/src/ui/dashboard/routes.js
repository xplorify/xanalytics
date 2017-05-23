import { PLATFORM } from 'aurelia-pal';

export let routes = [
  { route: '/', name: 'Real Time', moduleId: PLATFORM.moduleName('./realtime/realtime'), nav: true, title: 'Real Time' },
  { route: '/queries', name: 'Queries', moduleId: PLATFORM.moduleName('./queries/queries'), nav: true, title: 'Queries' }
];
