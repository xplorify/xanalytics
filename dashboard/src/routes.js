export let routes = [{
    route: [''],
    name: 'welcome',
    moduleId: PLATFORM.moduleName('ui/welcome/welcome'),
    nav: true,
    title: 'Welcome'
  },
  {
    route: ['dashboard'],
    name: 'dashboard',
    moduleId: PLATFORM.moduleName('ui/dashboard/index'),
    nav: true,
    title: 'Dashboard'
  },
  {
    route: ['login'],
    name: 'login',
    moduleId: PLATFORM.moduleName('ui/account/login'),
    nav: true,
    title: 'Login'
  },
  {
    route: ['register'],
    name: 'register',
    moduleId: PLATFORM.moduleName('ui/account/register'),
    nav: true,
    title: 'Register'
  }
];
