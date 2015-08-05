
'use strict';

var UrlPattern = require('url-pattern');


module.exports = Route;


function Route(name, pathSegments, queryKeys) {

  this.name = name;
}


Route.prototype = {};
