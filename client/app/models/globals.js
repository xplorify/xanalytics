var location = window.location;
export let globals = {
    options: {
        getUserInfoUrl: location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/api/Account/GetUserInfo'
    },
    serverUrl: __SERVER__,
    ipAddress: null,
    countryCode: null,
    connection: null,
    detectRtc: {},
    application: __APPLICATION__,
    userInfo: null
}