
'use strict';

import Route from './Route';
var urlTools = require('./urlTools');


module.exports = function routerFactory() {

  return {

    root: null,

    routes: {},

    queues: { __absolute__: [] },

    add(name, path) {
      const route = new Route(name, path);
      this.register(route);
      return route;
    },

    register: function (route) {

      const { routes } = this;

      if (route.path === '/') {
        routes[route.name] = this.root = route;
        return this.flushQueueFor(route);
      }

      if (route.isAbsolute()) {
        if (!this.root) return this.enqueue(null, route);
        routes[route.name] = route;
        this.root.addChild(route);
        return this.flushQueueFor(route);
      }

      var parentName = route.parentName;
      var parentRoute = this.routes[parentName];

      if (parentName && !parentRoute) return this.enqueue(parentName, route);

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

        children.sort((a, b) => b.specificity - a.specificity);

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
          else continue;
        }

        if (!matched) break;
      }

      if (unmatched.length) return null;

      var params = this.flattenParams(results);
      var query = urlParts.search
        ? urlTools.parseQuery(urlParts.search)
        : {};

      return [route.name, params, query];
    },

    href() {
      return this.toUrl(...arguments);
    },

    toUrl(name, params, query, fragment) {
      const pathname = this.routes[name].generate(params);
      return urlTools.combine(pathname, query, fragment);
    },

    flattenParams(results) {
      return results
        .reduce((flattened, resultSet) => flattened.concat(resultSet), [])
        .reduce((params, result) => Object.assign(params, result), {});
    },

    enqueue(parentName, route) {
      const { queues } = this;
      if (!parentName) queues.__absolute__.push(route);
      else {
        this.queues[parentName] || (queues[parentName] = []);
        this.queues[parentName].push(route);
      }
      return this;
    },

    flushQueueFor(route) {
      const { root, queues } = this;
      let queue;
      if (route === root) {
        queue = queues.__absolute__;
        while (queue && queue.length) {
          this.register(queue.pop());
        }
      }
      queue = queues[route.name];
      while (queue && queue.length) {
        this.register(queue.pop());
      }
      return this;
    }

  };
};
