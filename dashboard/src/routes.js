export let route = [
    { route: ['', 'welcome'], name: 'welcome', moduleId: PLATFORM.moduleName('./welcome'), nav: true, title: 'Welcome' },
    // { route: 'users', name: 'users', moduleId: PLATFORM.moduleName('./users'), nav: true, title: 'Github Users' },
    // { route: 'child-router', name: 'child-router', moduleId: PLATFORM.moduleName('./child-router'), nav: true, title: 'Child Router' },
    { route: 'dashboard', name: 'dashboard', moduleId: PLATFORM.moduleName('dashboard/vms/index'), nav: true, title: 'Dashboard' },
    { route: ['login'], name: 'login', moduleId: PLATFORM.moduleName('account/vms/login/login'), nav: true, title: 'Login' },
    { route: ['register'], name: 'register', moduleId: PLATFORM.moduleName('account/vms/register/register'), nav: true, title: 'Register' },
];