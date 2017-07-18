let env = (__DEV__ ? 'dev' : 'prd');
let result = require('./globals.' + env);
export let globals = result;
