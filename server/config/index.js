var env = process.env.NODE_ENV ?  process.env.NODE_ENV.replace(" ", "") : 'dev';
console.log("loading configuration for environment : " + env);

var config = require('./config.' + env);
module.exports = config;