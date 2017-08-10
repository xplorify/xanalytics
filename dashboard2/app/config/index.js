var env = __ENV__ ? __ENV__ : 'dev';
var config = require('./config.' + env);
module.exports = config;
