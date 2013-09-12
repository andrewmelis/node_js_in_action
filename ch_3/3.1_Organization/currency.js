var canadianDollar = 0.91;

function roundTwoDecimals(amount) {
  return Math.round(amount * 100) / 100;
}

exports.canadianToUS = function(canadian) {	//set in exports module so it can be used by code requiring this module
  return roundTwoDecimals(canadian * canadianDollar);
}

exports.USToCanadaian = function(us) {
  return roundTwoDecimals(us / canadianDollar);
}

//only the two functions can be accessed by an application including the module
  //roundTwoDecimals cannot directly be accessed

