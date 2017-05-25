export let routes = [
  // {
  //   route: [''],
  //   name: 'welcome',
  //   moduleId: PLATFORM.moduleName('ui/welcome/welcome'),
  //   nav: true,
  //   title: 'Welcome'
  // },
  {
    route: [''],
    name: 'dashboard',
    moduleId: PLATFORM.moduleName('ui/dashboard/index'),
    nav: true,
    title: 'Dashboard',
    isVisible: true,
    auth: true
  },
  {
    route: ['login'],
    name: 'login',
    moduleId: PLATFORM.moduleName('ui/account/login'),
    nav: true,
    title: 'Login',
    isVisible: true,
  },
  {
    route: ['register'],
    name: 'register',
    moduleId: PLATFORM.moduleName('ui/account/register'),
    nav: true,
    title: 'Register',
    isVisible: true
  },
  {
    route: ['logout'],
    name: 'logout',
    moduleId: PLATFORM.moduleName('ui/account/logout'),
    nav: true,
    title: 'Logout',
    isVisible: true
  }
];
