import Vue from 'vue';
import Router from 'vue-router';
const Dashboard = () =>
  import ('../components/dashboard/index');
const Login = () =>
  import ('../components/auth/login');
const Register = () =>
  import ('../components/auth/register');
const Realtime = () =>
  import ('../components/dashboard/realtime/realtime');
const Queries = () =>
  import ('../components/dashboard/queries/queries');


Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [{
    path: '/',
    name: '',
    component: Dashboard,
    children: [
      {
        path: '',
        name: 'realtime',
        component: Realtime
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: Queries
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  }
  ]
})
