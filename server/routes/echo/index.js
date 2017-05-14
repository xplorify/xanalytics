var sockjs = require('sockjs'),
    controller = require('./controller');

var echo = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });

module.exports = {
    init: function(server) {
        echo.on('connection', controller.onConnection);
        echo.installHandlers(server, { prefix: '/echo' });
        return echo;
    }
}