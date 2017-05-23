import { storage } from './storage';

class SecurityUtils {

    setAccessToken(accessToken, persistent) {
        storage.set("accessToken", accessToken, persistent);
    }

    getSecurityHeaders() {
        var accessToken = storage.get("accessToken");

        if (accessToken) {
            return { "Authorization": "Bearer " + accessToken };
        }

        return {};
    }
}

export let securityUtils = new SecurityUtils();