var env = __ENV__ ? __ENV__ : 'DEV';
var config = require('./config.' + env);
module.exports = config;
