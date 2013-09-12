//require is one of few synchronous I/O operations in Node.js
var currency = require('./currency'); 

//require returns contents of exports object defined in the module
console.log('50 Canadian dollars equals this amount of US dollars:');
console.log(currency.canadianToUS(50));

console.log('30 US dollars equals this amount of Canadian dollars:');
console.log(currency.USToCanadaian(30));
