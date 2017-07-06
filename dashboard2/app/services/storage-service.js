class Storage {
    constructor() {
        this.localStorage = window.localStorage;
        this.sessionStorage = window.sessionStorage;
    }

    get(key) {
        return this.sessionStorage[key] || this.localStorage[key];
    }

    getSession(key) {
        return this.sessionStorage[key];
    }

    getLocal(key) {
        return this.localStorage[key];
    }

    removeSession(key) {
        this.sessionStorage.removeItem(key);
    }

    removeLocal(key) {
        this.localStorage.removeItem(key);
    }

    setSession(key, value) {
        this.sessionStorage[key] = value;
    }

    setLocal(key, value) {
        this.localStorage[key] = value;
    }

    set(key, value, rememberMe) {
        if (rememberMe) {
            this.localStorage[key] = value;
        } else {
            this.sessionStorage[key] = value;
        }
    }

    clear(key) {
        this.localStorage.removeItem(key);
        this.sessionStorage.removeItem(key);
        return true;
    }

    restore(key) {
        var backupText = localStorage[key],
            backup;

        if (backupText) {
            backup = JSON.parse(backupText);

            for (var key in backup) {
                sessionStorage[key] = backup[key];
            }

            localStorage.removeItem(key);
        }
    }
}

export let storage = new Storage();