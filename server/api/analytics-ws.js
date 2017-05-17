var sockjs = require('sockjs');
var analyticsService = require("../services/analytics/analytics-service");
var storeService = require("../services/store/store-service");
var analyticsWs = {};

analyticsWs.getConnectionId = function(conn) {
    return conn.url.split("/")[3];
};

analyticsWs.onClose = function(conn) {
    // find connection by connectionId and set end date
    var connectionId = analyticsWs.getConnectionId(conn);
    console.log("Closing WS connection: " + conn);
    return analyticsService.closeConnection(connectionId)
        .then(function() {
            analyticsService.removeUser(connectionId);
            var infoObj = {
                removeConnection: connectionId
            };
            storeService.notifyAdmin(infoObj);
        });
};

analyticsWs.onData = function(conn, message) {
    var connectionId = analyticsWs.getConnectionId(conn);
    console.log("New message received via connection '" + connectionId + "': " + message);
    var data = JSON.parse(message);
    if (data.userName) {
        conn.userName = data.userName;
    }
    storeService.addUser(connectionId, conn);
    return analyticsService.addNewEvent(data)
        .then(function(info) {
            storeService.notifyAdmin(info);
        });
};

analyticsWs.onConnection = function(conn) {
    console.log("New WS connection: " + conn);
    var connectionId = analyticsWs.getConnectionId(conn);
    storeService.addUser(connectionId, conn);
    conn.on('data', function(message) { analyticsWs.onData(conn, message); });
    conn.on('close', function() { analyticsWs.onClose(conn); });
};


analyticsWs.echo = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });
analyticsWs.echo.on('connection', analyticsWs.onConnection);

module.exports = analyticsWs;
