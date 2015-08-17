
'use strict';

var xtend = require('xtend/mutable');
var Route = require('./Route');


module.exports = router;


function router(window, options) {

  options || (options = {});

  var location = window.location;
  var history = window.history;
  var windowEvent = history.pushState && (options.html5 !== false)
    ? 'popstate'
    : 'hashchange';

  return {

    onChange: null,


    sendRouteChange: function () {

      var url = this.getUrl();
      var found = this.findRoute(url);

      this.onChange.apply(null, found);
    },


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


    findRoute: function (url) {

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

      var pathLength = path.split('/').length - 1;
      var possibleRoutes = this.routesByLength[pathLength] || [];
      var routeIndex = 0;
      var route, params;

      while (!params && routeIndex < possibleRoutes.length) {

        route = possibleRoutes[routeIndex];
        params = route.match(path);
        routeIndex++;
      }

      if (!params) return null;

      if (query) {

        xtend(params, route.parseQuery(query));
      }

      return [route.name, params];
    },


    href: function (name, params) {

      return this.routes[name].toRouteString(params);
    },


    listen: function (onChange) {

      this.onChange = onChange;
      this.sendRouteChange = this.sendRouteChange.bind(this);
      this.watchLocation();
      this.sendRouteChange();
    },


    watchLocation: function () {

      window.addEventListener(windowEvent, this.sendRouteChange);
    },


    ignoreLocation: function () {

      window.removeEventListener(windowEvent, this.sendRouteChange);
    },


    update: function (stateName, params, options) {

      var url = this.href(stateName, params);

      this.setUrl(url, options);
    },


    getUrl: function () {

      return windowEvent === 'popstate'
        ? location.pathname + location.search + location.hash
        : location.hash.slice(1) || '/';
    },


    setUrl: function (url, options) {

      var defaults = { replace: false };

      options || (options = {});
      options = xtend(defaults, options);

      if (windowEvent === 'popstate') {

        if (options.replace) {

          history.replaceState({}, null, url);
        }
        else {

          history.pushState({}, null, url);
        }
      }
      else {

        if (options.replace) {

          var href = location.protocol +
            '//' +
            location.host +
            location.pathname +
            location.search +
            '#' +
            url;

          this.ignoreLocation();
          location.replace(href);
          this.watchLocation();
        }
        else {

          this.ignoreLocation();
          location.hash = url;
          this.watchLocation();
        }
      }
    }

  };
}
