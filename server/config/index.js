var logger = require('winston');

var env = process.env.NODE_ENV ? process.env.NODE_ENV.replace(" ", "") : 'dev';
logger.info("loading configuration for environment : " + env);

var config = require('./config.' + env);
module.exports = config;