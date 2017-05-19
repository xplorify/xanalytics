import { globals } from '../globals';
//
var urls = {
    login: globals.serverUrl + '/api/auth/login',
    register: globals.serverUrl + '/api/auth/register',
};

class AuthenticationService {
    login(userName, password) {
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            var url = urls.login;
            var body = {
                username: userName,
                password: password
            };
            req.open('POST', url, true);
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify(body));
            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    var result = JSON.parse(req.responseText);
                    resolve(result);
                }
            };
            req.onerror = function () {
                reject(req.responseText);
            }
        });
    }

     register(data) {
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            var url = urls.register;
            var body = {
                username: data.userName,
                password: data.password,
                firstname: data.firstName,
                lastname: data.lastName,
                email: data.email
            };
            req.open('POST', url, true);
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify(body));
            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    var result = JSON.parse(req.responseText);
                    resolve(result);
                }
            };
            req.onerror = function () {
                reject(req.responseText);
            }
        });
    }
}

export let authenticationService = new AuthenticationService(); 