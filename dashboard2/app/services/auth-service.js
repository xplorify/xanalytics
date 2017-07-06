import axios from 'axios';
import { storage } from "../services/storage-service";
import { globals } from "../globals";
import { config } from "../config";
import router from '../router';
Promise = window.Promise || require('bluebird');

let self = null;

let endpoints = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  getUserInfo: "/api/auth/getUserInfo"
};

class AuthService {

  constructor() {
    self = this;
  }

  getUserInfo() {
    const authHeader = storage.get("Token");
    if (authHeader) {
      const getUserInfoApi = `${config.settings.domainUrl}${endpoints.getUserInfo}`;
      return axios.get(getUserInfoApi, {
          headers: self.setHeaders()
        })
        .then(function(response) {
          if (response && response.data) {
            globals.currentUser = response.data;
          }
          return { response: response, success: true };
        })
        .catch(function(error) {
          return { error: error, success: false };
        });
    }
    return Promise.resolve();
  }

  login(input) {
    const loginApi = `${config.settings.domainUrl}${endpoints.login}`;
    return axios.post(loginApi, input)
      .then(function(response) {
        storage.set("Token", response.data.token, input.rememberme);
        if (response && response.data && response.data.user) {
          globals.currentUser = response.data.user;
        }
        return { response: response, success: response.data.success };
      })
      .catch(function(error) {
        return { error: error, success: false };
      });
  }

  logout() {
    globals.currentUser = null;
    return Promise.all([storage.clear("Token")])
      .then(function() {
        router.push('/');
      });
  }

  register(input) {
    const registerApi = `${config.settings.domainUrl}${endpoints.register}`;
    input.roles = ["admin"];
    return axios.post(registerApi, input)
      .then(function(response) {
        storage.set("Token", response.data.token);
        if (response && response.data && response.data.user) {
          globals.currentUser = response.data.user;
        }
        return { response: response, success: response.data.success };
      })
      .catch(function(error) {
        return { error: error, success: false };
      });
  }

  setHeaders() {
    return {
      'accept': 'application/json',
      'accept-language': 'en_US',
      'content-type': 'application/x-www-form-urlencoded',
      'authorization': storage.get("Token")
    }
  }
}

export let authService = new AuthService();
