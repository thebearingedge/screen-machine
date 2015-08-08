
'use strict';

var xtend = require('xtend/mutable');
var Route = require('./Route');


module.exports = router;


function router(machine) {

  return {

    routes: {},


    routesByLength: {},


    add: function (name, pathSegments, querySegment) {

      var route = new Route(name, pathSegments, querySegment);
      var pathLength = pathSegments.length;
      var routesByLength = this.routesByLength;

      routesByLength[pathLength] || (routesByLength[pathLength] = []);
      routesByLength[pathLength].push(route);

      this.routes[name] = route;

      return route;
    },


    find: function (url) {

      if (url[0] !== '/') {

        url = '/' + url;
      }

      var queryStart = url.indexOf('?');
      var path;
      var query;

      if (queryStart > -1) {

        path = url.slice(0, queryStart);
        query = url.slice(queryStart + 1);
      }
      else {

        path = url;
      }

      var pathSegments = path.split('/').slice(1);
      var possibleRoutes = this.routesByLength[pathSegments.length] || [];
      var routeIndex = 0;
      var routesLength = possibleRoutes.length;
      var route, params;

      while (!params && routeIndex < routesLength) {

        route = possibleRoutes[routeIndex];
        params = route.match(path);

        routeIndex++;
      }

      if (!params) return null;

      if (query) {

        xtend(params, route.parseQuery(query));
      }

      return machine.transitionTo(route.name, params);
    },


    href: function (name, params) {

      return this.routes[name].reverse(params);
    }

  };

}
