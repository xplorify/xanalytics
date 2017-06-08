var storeModel = require('../models/store');
var logger = require('winston');

var storeService = {};

storeService.addUser = function(connectionId, user) {
    storeModel.users[connectionId] = user;
    if (user.userName === 'admin') {
        logger.info("Adding admin");
        storeModel.admin[connectionId] = user;
    }
};

storeService.removeUser = function(connectionId) {
    logger.info("Removing user connection from the store...");
    if (storeModel.admin && storeModel.admin[connectionId]) {
        delete storeModel.admin[connectionId];
        delete storeModel.users[connectionId];
    } else {
        delete storeModel.users[connectionId];
    }
};

storeService.notifyAdmin = function(info) {
    // find admin connection and send him the connections count
    logger.info("Preparing to send message to admins with connection ids:  " + Object.keys(storeModel.admin));
    var infoString = JSON.stringify(info);
    logger.info("Message: " + infoString);
    for (var k in storeModel.admin) {
        if (storeModel.admin.hasOwnProperty(k)) {
            //sending to admin the latest user event for a specific connection
            logger.info("Sending message to admin: " + storeModel.admin[k].userName);
            storeModel.admin[k].write(infoString);
        }
    }
};


module.exports = storeService;