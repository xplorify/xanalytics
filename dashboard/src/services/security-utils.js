import { storage } from './storage';

class SecurityUtils {

  setAccessToken(accessToken, persistent) {
    storage.set('accessToken', accessToken, persistent);
  }

  getSecurityHeaders() {
    let accessToken = storage.get('accessToken');

    if (accessToken) {
      return { 'Authorization': 'Bearer ' + accessToken };
    }

    return {};
  }
}

export let securityUtils = new SecurityUtils();
