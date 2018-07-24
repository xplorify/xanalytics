<template>
  <div id="app">
    <div class="w3-bar w3-border w3-blue">
      <router-link to="/dashboard" v-if="isAuthenticated" class="w3-bar-item w3-button" active-class="active" exact>
        Dashboard
      </router-link>
      <router-link to="/login" v-if="!isAuthenticated" class="w3-bar-item w3-button" active-class="active" exact>
        Login
      </router-link>
      <router-link to="/register" v-if="!isAuthenticated && globalEnv !== 'met'" class="w3-bar-item w3-button" active-class="active" exact>
        Register
      </router-link>
      <a class="w3-bar-item w3-button" active-class="active" v-if="isAuthenticated" v-on:click="logout">Logout</a>
    </div>
    <div class="page-host w3-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import { globals } from './models/globals';
  import { XAnalytics } from 'xplorify.analytics.client/dist/app';
  import { storage } from './services/storage';
  import { security } from './services/security';
  import { config } from './config';
  import { authService } from './services/auth-service';
  import { enums } from './models/enums';
  import { route } from './models/urls';
  import { applicationService } from './services/application-service';
  import router from './router';
  Promise = window.Promise || require('bluebird');

  export default {
    name: 'app',
    data() {
      return {
        globals: globals,
        isLogginOut: false,
        isLogoutVisible: true,
        globalEnv : __ENV__,
        options: {
          application: globals.application,
          serverUrl: globals.serverUrl,
          getUserInfoUrl: globals.getUserInfoLocation,
          authSchema: globals.authSchema
        }
      }
    },
    created: function () {
      var env = __ENV__ ? __ENV__ : 'dev';
      var isDevEnv = env === 'dev';
      var ENV = env === 'dev'? 'dev': env === 'prd'? 'prd': 'met';
      this.globals.xAnalytics = new window.XAnalytics(this.options);
      this.isLogginOut = false;
      this.isLogoutVisible = true;
      if (this.isLogginOut) {
        return false;
      }
      var accessToken = storage.get('accessToken');
      console.log("accessToken: " + accessToken);
      if (accessToken !== undefined) {
        return this.setUserAndApps(accessToken, ENV);
      } else {
        return this.goToLogin(isDevEnv, ENV);
      }
    },
    methods: {
      logout: function () {
        this.isLogginOut = true;
        this.isLogoutVisible = false;
        console.log("Logging out");
        var dataObj = {
          userName: security.userInfo ? security.userInfo.userName : "Anonymous",
          referrer: document.referrer,
          eventType: enums.eventLogs.logout
        }
        this.globals.xAnalytics.send(dataObj);
        if (security.userInfo && security.userInfo.accessToken) {
          storage.clear("accessToken");
          security.userInfo = null;
        }
        console.log("Inside logout, isAuth: false");
        return router.push({ name: 'login' });
      },
      goToLogin: function (isDevEnv, ENV) {
        var isReportUrl = isDevEnv
          ? window.location.href.substring(0, 33) === config.settings.analyticsUrl
          : window.location.href.substring(0, 42) === config.settings.analyticsUrl;
        if (isReportUrl) {
          var returnUrl = window.location.href;
          storage.setLocal("returnUrl", returnUrl);
        }
        var self = this;
        this.isLogoutVisible = false;

        if (ENV == 'dev') {
          return applicationService.getDevelopmentApps()
            .then(function (response) {
              if (response && response.response && response.response.data) {
                var resources = response.response.data.result.applications;
                self.globals.applications = resources;
              }
            })
            .then(function () {
              return router.push({ name: 'login' });
            });
        } else if (ENV == 'prd') {
          return applicationService.getProductionApps()
            .then(function (response) {
              if (response && response.response && response.response.data) {
                var resources = response.response.data.result.applications;
                self.globals.applications = resources;
              }
            })
            .then(function () {
              return router.push({ name: 'login' });
            });
        } else {
          return applicationService.getMetproApps()
            .then(function (response) {
              if (response && response.response && response.response.data) {
                var resources = response.response.data.result.applications;
                self.globals.applications = resources;
              }
            })
            .then(function () {
              return router.push({ name: 'login' });
            });
        }
      },
      setUserAndApps: function (accessToken, env) {
        var self = this;
        return authService.getUserInfo()
          .then(function (result) {
            if (result && result.err) {
              storage.clear("accessToken");
              security.userInfo = null;
              return router.push({ name: 'login' });
            } else {
              let dataObj = {
                user: result,
                token: accessToken
              };
              security.setAuthInfo(dataObj);
              return result && result._id != null;
            }
          })
          .then(function () {
            if (env == 'dev') {
              return applicationService.getDevelopmentApps();
            } else if (env == 'prd') {
              return applicationService.getProductionApps();
            }
            else {
              return applicationService.getMetproApps();
            }
          })
          .then(function (response) {
            if (response && response.response && response.response.data) {
              var resources = response.response.data.result.applications;
              self.globals.applications = resources;
            }
          });
      }
    },
    computed: {
      isAuthenticated: function () {
        return this.isLogoutVisible;
      }
    }
  }
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>