
'use strict';

var UrlPattern = require('url-pattern');
var reversePath = require('reverse-path');


module.exports = Route;


function Route(name, pathSegments) {

  this.name = name;
  this.path = '/' + pathSegments.join('/');
  this.pattern = new UrlPattern(this.path);
}


Route.prototype.match = function (path) {

  return this.pattern.match.call(this.pattern, path);
};


Route.prototype.toRouteString = function (params, query) {

  var path = reversePath(this.path, params);
  var queryPairs = Object
    .keys(query)
    .reduce(function (pairs, key) {

      pairs.push(key + '=' + query[key]);

      return pairs;
    }, []);

  if (queryPairs.length) {

    path += '?' + queryPairs.join('&');
  }

  return path;
};


Route.prototype.parseQuery = function (queryString) {

  return queryString
    .split('&')
    .reduce(function (queryParams, pair) {

      var querySplit = pair.split('=');

      queryParams[querySplit[0]] = querySplit[1];

      return queryParams;
    }, {});
};
