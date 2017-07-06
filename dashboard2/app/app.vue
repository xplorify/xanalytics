<template>
  <div id="app">
    <div class="w3-bar w3-white w3-wide w3-padding w3-card-2">
      <router-link to="/" class="w3-bar-item w3-button">
        <img src="../assets/images/logo/xplorify_logo.png">
      </router-link>
      <!-- Float links to the right. Hide them on small screens -->
      <div class="w3-right w3-hide-small">
        <span v-if="isAuthenticated" class="w3-text-blue">
          <span class="w3-bar-item">Welcome: {{globals.currentUser.username}}</span>
        </span>
        <router-link to="/rooms" v-if="isAuthenticated" class="w3-bar-item w3-button" active-class="active" exact>
          Rooms
        </router-link>
        <router-link to="/login" v-if="!isAuthenticated" class="w3-bar-item w3-button" active-class="active" exact>
          Login
        </router-link>
        <router-link to="/register" v-if="!isAuthenticated" class="w3-bar-item w3-button" active-class="active" exact>
          Register
        </router-link>
        <a class="w3-bar-item w3-button" active-class="active" v-if="isAuthenticated" v-on:click="logout">Logout</a>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import { globals } from "./globals";
import { config } from "./config";
import { logger } from "./helpers/logger";
import { authService } from './services/auth-service';
Promise = window.Promise || require('bluebird');

export default {
  name: 'app',
  data() {
    return {
      globals: globals
    }
  },
  created: function () {
    return Promise.all([authService.getUserInfo()])
      .then(function (response) {
        if (response && response.success) {
          return true;
        }
        else {
          console.log(reponse.error);
        }
      })
      .catch(function () { console.log('Unexisting user'); });
  },
  methods: {
    logout: function () {
      return authService.logout();
    }
  },
  computed: {
    isAuthenticated: function () {
      return this.globals.currentUser !== null;
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