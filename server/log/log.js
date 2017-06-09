var logger = require('winston');
logger
    .remove(logger.transports.Console)
    .add(logger.transports.File, {
        level: 'info',
        filename: './log/access.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, //5MB
        maxFiles: 10,
        colorize: false
    })
    .add(logger.transports.Console, {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true
    });

logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};

module.exports = logger;