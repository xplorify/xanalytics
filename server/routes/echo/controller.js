var analyticsService = require("../../services/analytics-service");
var storeService = require("../../services/store-service");
var logger = require("winston");

var controller = {};

controller.getConnectionId = function (conn) {
    return conn.url.split("/")[3];
};

controller.onData = function (conn, message) {
    var connectionId = controller.getConnectionId(conn);
    logger.info("New message received via connection '" + connectionId + "': " + message);
    var data = JSON.parse(message);
    if (data.userName) {
        conn.userName = data.userName;
    }

    conn.isAdmin = data.isAdmin;
    storeService.addUser(connectionId, conn);
    return analyticsService.addNewEvent(data)
        .then(function (info) {
            storeService.notifyAdmin(info);
        });
};

controller.onClose = function (conn) {
    // find connection by connectionId and set end date
    var connectionId = controller.getConnectionId(conn);
    logger.info("Closing WS connection: " + conn);
    return analyticsService.closeConnection(connectionId)
        .then(function () {
            storeService.removeUser(connectionId);
            var infoObj = {
                removeConnection: connectionId
            };
            storeService.notifyAdmin(infoObj);
        });
};

controller.onConnection = function (conn) {
    logger.info("New WS connection: " + conn);
    var connectionId = controller.getConnectionId(conn);
    storeService.addUser(connectionId, conn);
    conn.on('data', function (message) { controller.onData(conn, message); });
    conn.on('close', function () { controller.onClose(conn); });
};

module.exports = controller;