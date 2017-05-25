import { globals } from '../models/globals';

const urls = {
  login: globals.serverUrl + '/api/auth/login',
  register: globals.serverUrl + '/api/auth/register'
};

class AuthService {
  login(userName, password) {
    return new Promise(function(resolve, reject) {
      let req = new XMLHttpRequest();
      let url = urls.login;
      let body = {
        username: userName,
        password: password
      };
      req.open('POST', url, true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.send(JSON.stringify(body));
      req.onreadystatechange = function() {
        if (req.readyState === 4) {
          let result = JSON.parse(req.responseText);
          resolve(result);
        }
      };
      req.onerror = function() {
        reject(req.responseText);
      };
    });
  }

  register(data) {
    return new Promise(function(resolve, reject) {
      let req = new XMLHttpRequest();
      let url = urls.register;
      let body = {
        username: data.userName,
        password: data.password,
        firstname: data.firstName,
        lastname: data.lastName,
        email: data.email
      };
      req.open('POST', url, true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.send(JSON.stringify(body));
      req.onreadystatechange = function() {
        if (req.readyState === 4) {
          let result = JSON.parse(req.responseText);
          resolve(result);
        }
      };
      req.onerror = function() {
        reject(req.responseText);
      };
    });
  }
}

export let authService = new AuthService();
