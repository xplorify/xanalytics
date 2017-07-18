import { globals } from '../models/globals';

const urls = {
  login: globals.serverUrl + '/api/auth/login',
  register: globals.serverUrl + '/api/auth/register',
  getUserInfo: globals.serverUrl + '/api/auth/getUserInfo'
};

class AuthService {
  login(data) {
    return new Promise(function (resolve, reject) {
      let req = new XMLHttpRequest();
      let url = urls.login;
      let body = {
        username: data.username,
        password: data.password
      };
      req.open('POST', url, true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.send(JSON.stringify(body));
      req.onreadystatechange = function () {
        if (req.readyState === 4) {
          let result = JSON.parse(req.responseText);
          resolve(result);
        }
      };
      req.onerror = function () {
        reject(req.responseText);
      };
    });
  }

  register(data) {
    return new Promise(function (resolve, reject) {
      let req = new XMLHttpRequest();
      let url = urls.register;
      let body = {
        username: data.username,
        password: data.password,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email
      };
      req.open('POST', url, true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.send(JSON.stringify(body));
      req.onreadystatechange = function () {
        if (req.readyState === 4) {
          let result = JSON.parse(req.responseText);
          resolve(result);
        }
      };
      req.onerror = function () {
        reject(req.responseText);
      };
    });
  }

  getUserInfo() {
    return new Promise(function (resolve, reject) {
      let req = new XMLHttpRequest();
      let url = urls.getUserInfo;
      req.open('GET', url, true);
      req.setRequestHeader('Content-Type', 'application/json');
      var accessToken = window.sessionStorage["accessToken"] || window.localStorage["accessToken"];
      if (!accessToken.startsWith("Bearer") && !accessToken.startsWith("JWT")) {
        accessToken = globals.authSchema + accessToken;
      }
      req.setRequestHeader("Authorization", accessToken);
      req.send(null);
      req.onreadystatechange = function () {
        if (req.readyState === 4) {
          if (req.responseText === "Unauthorized") {
            let result = { err: "Unauthorized" }
            resolve(result);
          } else {
            let result = JSON.parse(req.responseText);
            resolve(result);
          }
        }
      };
      req.onerror = function () {
        reject(req.responseText);
      };
    });
  }

}

export let authService = new AuthService();
