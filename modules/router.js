
'use strict';

var Route = require('./Route');
var urlTools = require('./urlTools');


module.exports = function routerFactory() {

  return {

    root: null,


    routes: {},


    queues: {
      __absolute__: []
    },


    add: function (name, path) {

      var route = new Route(name, path);

      this.register(route);
      return route;
    },


    register: function (route) {

      if (route.path === '/') {

        this.routes[route.name] = this.root = route;
        return this.flushQueueFor(route);
      }

      if (route.isAbsolute()) {

        if (!this.root) {

          return this.enqueue(null, route);
        }

        this.routes[route.name] = route;
        this.root.addChild(route);
        return this.flushQueueFor(route);
      }

      var parentName = route.parentName;
      var parentRoute = this.routes[parentName];

      if (parentName && !parentRoute) {

        return this.enqueue(parentName, route);
      }

      this.routes[route.name] = route;
      parentRoute || (parentRoute = this.root);
      parentRoute.addChild(route);
      return this.flushQueueFor(route);
    },


    find: function (url) {

      var urlParts = urlTools.toParts(url);
      var unmatched = urlParts.pathname.split('/').slice(1);
      var results = [];
      var route = this.root;

      results.push(route.match(unmatched));

      var children = route.children
        ? route.children.slice()
        : [];

      while (unmatched.length && children.length) {

        var matched;

        children.sort(function (a, b) {

          return b.specificity - a.specificity;
        });

        for (var i = 0; i < children.length; i++) {

          var child = children[i];

          // jshint -W084
          if (matched = child.match(unmatched)) {

            results = results.concat(matched);
            route = child;
            children = route.children
              ? route.children.slice()
              : [];

            break;
          }
          else {

            continue;
          }
        }

        if (!matched) {

          break;
        }
      }

      if (unmatched.length) {

        return null;
      }

      var params = this.flattenParams(results);
      var query = urlParts.search
        ? urlTools.parseQuery(urlParts.search)
        : {};

      return [route.name, params, query];
    },


    href: function () {

      return this.toUrl.apply(this, arguments);
    },


    toUrl: function (name, params, query, fragment) {

      var pathname = this.routes[name].generate(params);

      return urlTools.combine(pathname, query, fragment);
    },


    flattenParams: function (results) {

      return results
        .reduce(function (flattened, resultSet) {

          return flattened.concat(resultSet);
        }, [])
        .reduce(function (params, result) {

          return Object.assign(params, result);
        }, {});
    },


    enqueue: function (parentName, route) {

      if (!parentName) {

        this.queues.__absolute__.push(route);
      }
      else {

        this.queues[parentName] || (this.queues[parentName] = []);
        this.queues[parentName].push(route);
      }

      return this;
    },


    flushQueueFor: function (route) {

      var queue;

      if (route === this.root) {

        queue = this.queues.__absolute__;

        while (queue && queue.length) {

          this.register(queue.pop());
        }
      }

      queue = this.queues[route.name];

      while (queue && queue.length) {

        this.register(queue.pop());
      }

      return this;
    }

  };
};
