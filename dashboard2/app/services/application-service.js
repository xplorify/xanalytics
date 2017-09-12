import axios from 'axios';
import { config } from "../config";
import { globals } from '../models/globals';
import router from '../router';
Promise = window.Promise || require('bluebird');

let self = null;

let endpoints = {
    getDevApps: "/api/application/getDevApps",
    getPrdApps: "/api/application/getPrdApps"
};

class ApplicationService {

    constructor() {
        self = this;
    }

    getDevelopmentApps() {
        const resourcesApi = `${globals.serverUrl}${endpoints.getDevApps}`;
        return axios.get(resourcesApi)
            .then(function (response) {
                var result = { response: response, success: response.data.success };
                return result;
            })
            .catch(function (error) {
                return { error: error, success: false };
            });
      
    }

     getProductionApps() {
        const resourcesApi = `${globals.serverUrl}${endpoints.getPrdApps}`;
        return axios.get(resourcesApi)
            .then(function (response) {
                var result = { response: response, success: response.data.success };
                return result;
            })
            .catch(function (error) {
                return { error: error, success: false };
            });
    }
}

export let applicationService = new ApplicationService();
