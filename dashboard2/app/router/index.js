import Vue from 'vue';
import Router from 'vue-router';
const Hello = () =>
  import ('../components/home/hello');
const Login = () =>
  import ('../components/auth/login');
const Register = () =>
  import ('../components/auth/register');


Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [{
      path: '/',
      name: 'hello',
      component: Hello
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
