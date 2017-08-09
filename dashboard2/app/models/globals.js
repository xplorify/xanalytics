let env = (__ENV__ ? __ENV__ : 'DEV');
let result = require('./globals.' + env);
export let globals = result;
