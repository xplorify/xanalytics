let env = (__ENV__ ? __ENV__ : 'dev');
let result = require('./globals.' + env);
export let globals = result;
