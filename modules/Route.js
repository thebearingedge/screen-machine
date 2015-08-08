
'use strict';

var UrlPattern = require('url-pattern');
var reversePath = require('reverse-path');


module.exports = Route;


function Route(name, pathSegments, querySegments) {

  this.name = name;
  this.path = '/' + pathSegments.join('/');
  this.pattern = new UrlPattern(this.path);
  this.queryKeys = querySegments
    .map(function (segment) {

      return segment.split('&');
    })
    .reduce(function (keys, splitSegment) {

      return keys.concat(splitSegment);
    }, []);
}


Route.prototype.match = function (path) {

  return this.pattern.match(path);
};


Route.prototype.reverse = function (params) {

  var path = reversePath(this.path, params);
  var queryPairs = this
    .queryKeys
    .reduce(function (pairs, key) {

      if (typeof params[key] !== 'undefined') {

        pairs.push(key + '=' + params[key]);
      }

      return pairs;
    }, []);

  if (queryPairs.length) {

    path += '?' + queryPairs.join('&');
  }

  return path;
};


Route.prototype.parseQuery = function (queryString) {

  var queryKeys = this.queryKeys;

  return queryString
    .split('&')
    .reduce(function (queryParams, pair) {

      var querySplit = pair.split('=');

      if (queryKeys.indexOf(querySplit[0]) > -1 ) {

        queryParams[querySplit[0]] = querySplit[1];
      }

      return queryParams;
    }, {});
};
