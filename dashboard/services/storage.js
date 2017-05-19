// import * as window from "window";

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

    set(key, value, isPersistent) {
        if (isPersistent) {
            this.localStorage[key] = value;
        } else {
            this.sessionStorage[key] = value;
        }
    }

    clear(key) {
        this.localStorage.removeItem(key);
        this.sessionStorage.removeItem(key);
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

    archive() {
        var backup = {};

        for (var i = 0; i < this.sessionStorage.length; i++) {
            backup[this.sessionStorage.key(i)] = this.sessionStorage[this.sessionStorage.key(i)];
        }

        this.localStorage["sessionStorageBackup"] = JSON.stringify(backup);
        this.sessionStorage.clear();
    }
}

export let storage = new Storage();