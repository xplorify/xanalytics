var location = window.location;
let result = {
    getUserInfoUrl: 'http://localhost:17981/api/Account/GetUserInfo',
    serverUrl: "https://localhost:444",
    application: { code: "dev", url: "http://localhost:8080" },
    ipAddress: null,
    countryCode: null,
    connection: null,
    detectRtc: {},
    userInfo: null,
    onData: null
};
result.userName = function () {
    var userName = result.userInfo
        ? result.userInfo.userName
            ? result.userInfo.userName
            : result.userInfo.username
                ? result.userInfo.username
                : "Anonymous"
        : "Anonymous";
    return userName;
};
result.firstName = function () {
    var firstName = result.userInfo
        ? result.userInfo.firstName
            ? result.userInfo.firstName
            : result.userInfo.firstname
                ? result.userInfo.firstname
                : ""
        : "";
    return firstName;
};
result.lastName = function () {
    var lastName = result.userInfo
        ? result.userInfo.lastName
            ? result.userInfo.lastName
            : result.userInfo.lastname
                ? result.userInfo.lastname
                : ""
        : "";
    return lastName;
};

export let globals = result;