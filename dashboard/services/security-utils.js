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

    verifyStateMatch(fragment) {
        var state;

        if (typeof (fragment.access_token) !== "undefined") {
            state = storage.getSession("state")
            storage.removeSession("state");

            if (state === null || fragment.state !== state) {
                fragment.error = "invalid_state";
            }
        }
    }

    cleanUpLocation() {
        window.location.hash = "";
        if (history && typeof (history.pushState) !== "undefined") {
            history.pushState("", document.title, location.pathname);
        }
    }
}

export let securityUtils = new SecurityUtils();