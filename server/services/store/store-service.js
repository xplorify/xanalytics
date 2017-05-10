var storeModel = require('./model/store');

var storeService = {};

storeService.addUser = function(connectionId, user) {
    storeModel.users[connectionId] = user;
    if (user.userName === 'admin') {
        storeModel.admin[connectionId] = user;
    }
};

storeService.removeUser = function(connectionId) {
    console.log("Removing user connection from the store...");
    if (storeModel.admin && store.admin[connectionId]) {
        delete storeModel.admin[connectionId];
        delete storeModel.users[connectionId];
    } else {
        delete storeModel.users[connectionId];
    }
};

storeService.notifyAdmin = function(info) {
    // find admin connection and send him the connections count
    console.log("Preparing to send message to admins with conection ids:  " + Object.keys(storeModel.admin));
    var infoString = JSON.stringify(info);
    console.log("Message: " + infoString);
    for (var k in storeModel.admin) {
        if (storeModel.admin.hasOwnProperty(k)) {
            //sending to admin the latest user event for a specific connection
            console.log("Sending message to admin: " + storeModel.admin[k].userName);
            storeModel.admin[k].write(infoString);
        }
    }
};


module.exports = storeService;