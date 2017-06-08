// let env = production ? 'prd' || 'dev';
// console.log('Loading globals for environment : ' + env);
let result = require('./globals.' + 'prd');

export let globals = result;
