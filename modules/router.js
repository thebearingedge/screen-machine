
'use strict';

var Route = require('./Route');


module.exports = router;


function router(machine, window, options) {

  options || (options = { html5: true });

  var routes = {};
  var routesByLength = {};
  var history = window.history;
  var location = window.location;
  var html5 = typeof history.pushState === 'function' &&
    options.html5;

  var controller = {

    addRoute: function (name, pathSegments, queryKeys) {

      var route = routes[name] = new Route(name, pathSegments, queryKeys);
      var pathLength = pathSegments.length;

      routesByLength[pathLength] || (routesByLength[pathLength] = []);
      routesByLength[pathLength].push(route);
    },


    findRoute: function (url) {

      if (url[0] !== '/') {

        url = '/' + url;
      }

      var queryStart = url.lastIndexOf('?');
      var path;
      var query;

      if (queryStart > -1) {

        path = url.slice(0, queryStart);
        query = url.slice(queryStart + 1);
      }
      else {

        path = url;
      }

      var pathSegments = path.split('/');
      var routes = this.routesByLength[pathSegments.length].slice();
      var routeIndex = 0;
      var routesLength = routes.length;
      var route, match;

      for (; routeIndex < routesLength; routeIndex++) {

        route = routes[routeIndex];
        match = route.match(path);

        if (match) break;
      }

    },


    listener: {
      name: null,
      handler: null
    },


    watchUrl: function () {

      this.listener = html5
        ? { name: 'popstate', handler: handlePop }
        : { name: 'hashchange', handler: handleHash };

      window.addEventListener(this.listener.name, this.listener.handler);
    },


    ignoreUrl: function () {

      window.removeEventListener(this.listener.name, this.listener.handler);
    },


    setUrl: function (url, options) {

      options || (options = { replace: false });

      if (html5) {

        return setState.call(this, url, options);
      }

      return setHash.call(this, url, options);
    }

  };

  return controller;


  function handlePop() {

    var fullPath = location.pathname +
      location.search +
      location.hash;
  }


  function handleHash() {

    var hashPath = location.hash.slice(1);

  }


  function setState(url, options) {

    // jshint validthis: true
    if (options.replace) {

      history.replaceState({}, null, url);
    }
    else {

      history.pushState({}, null, url);
    }

    return this;
  }


  function setHash(url, options) {

    // jshint validthis: true
    this.ignoreUrl();

    if (options.replace) {

    }
    else {

      location.hash = url;
    }

    this.watchUrl();

    return this;
  }


}
