let self;
export class Routes {
  constructor() {
    self = this;
    self.routes = [
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
        isVisible: true
      },
      {
        route: ['register'],
        name: 'register',
        moduleId: PLATFORM.moduleName('ui/account/register'),
        nav: true,
        title: 'Register',
        isVisible: true
      }
    ];
    self.isLogoutVisible = false;
  }
}
