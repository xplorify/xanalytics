
var analyticsService = require("../../services/analytics/analytics-service");
var analyticsModel = require("../../models/analytics/index");
var analytics = {};

analytics.onClose = function (conn) {
    // find connection by connectionId and set end date
    var connectionId = conn.url.split("/")[3];
    return analyticsService.setConnectionEndDate(connectionId)
        .then(function () {
            console.log("Deleting connection ..............");
            if (analyticsModel.admin && analyticsModel.admin[connectionId]) {
                delete analyticsModel.admin[connectionId];
                delete analyticsModel.users[connectionId];
            } else {
                delete analyticsModel.users[connectionId];
            }

            console.log("Connection with id " + connectionId + " was closed");
            console.log("Preparing to send admins message ... ");
            console.log("admin keys: " + Object.keys(analyticsModel.admin));
            console.log("users keys: " + Object.keys(analyticsModel.users));
            var connectionsCount = analyticsModel.users ? Object.keys(analyticsModel.users).length : 0;

            for (var k in analyticsModel.admin) {
                if (analyticsModel.admin.hasOwnProperty(k)) {
                    console.log("Sending message " + connectionsCount + " to admin " + analyticsModel.admin[k].userName);
                    var infoObj = {
                        removeConnection: connectionId,
                        connectionsCount: connectionsCount
                    }
                    var stringInfo = JSON.stringify(infoObj);
                    analyticsModel.admin[k].write(stringInfo);
                }
            }
        });
}

analytics.onData = function (conn, message) {
    var connectionId = conn.url.split("/")[3];
    var data = JSON.parse(message);
    if (data.userName == 'admin') {
        analyticsModel.admin[connectionId] = conn;
        analyticsModel.admin[connectionId].userName = data.userName;
    }
    return analyticsService.addNewEvent(data)
        .then(function (info) {
            analyticsService.notifyAdmin(info);
        });
}

module.exports = analytics;