
var analyticsService = require("../../services/analytics/analytics-service");
var analyticsModel = require("../../models/analytics/index");
var analytics = {};

analytics.onClose = function (conn) {
    // find connection by connectionId and set end date
    var connectionId = conn.url.split("/")[3];
    return analyticsService.closeConnection(connectionId)
        .then(function () {
            analyticsService.disconnectUser(connectionId);
            var infoObj = {
                removeConnection: connectionId
            }
            analyticsService.notifyAdmin(infoObj);
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