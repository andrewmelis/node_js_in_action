var Currency = require('currency-prototype');	    //throws error, doesn't follow node rules
//var Currency = require('./currency-prototype');

var canadianDollar = 0.91;

var currency = new Currency(canadianDollar);
console.log(currency.canadianToUS(50));
console.log(currency.USToCanadaian(30));
