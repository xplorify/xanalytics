let env = (production ? 'prd' : 'dev');
let result = require('./globals.' + env);
console.log('Loading globals for environment : ' + env);
export let globals = result;
