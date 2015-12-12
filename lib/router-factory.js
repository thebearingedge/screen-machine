'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = routerFactory;

var _route = require('./route');

var _route2 = _interopRequireDefault(_route);

var _urlTools = require('./url-tools');

var _urlTools2 = _interopRequireDefault(_urlTools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function routerFactory() {

  return {

    root: null,

    routes: {},

    queues: { __absolute__: [] },

    add: function add(name, path) {
      return this.register(new _route2.default(name, path));
    },
    register: function register(route) {
      var routes = this.routes;

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
    find: function find(url) {
      var urlParts = _urlTools2.default.toParts(url);

      var _urlParts$pathname$sp = urlParts.pathname.split('/');

      var _urlParts$pathname$sp2 = _toArray(_urlParts$pathname$sp);

      var unmatched = _urlParts$pathname$sp2.slice(1);

      var results = [];
      var route = this.root;
      results.push(route.match(unmatched));
      var children = (route.children || []).slice();
      while (unmatched.length && children.length) {
        var matched = undefined;
        children.sort(function (a, b) {
          return b.specificity - a.specificity;
        });
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (matched = child.match(unmatched)) {
            results.push(matched);
            route = child;
            children = route.children ? route.children.slice() : [];
            break;
          } else continue;
        }
        if (!matched) break;
      }
      if (unmatched.length) return null;
      var params = flattenParams(results);
      var query = urlParts.search ? _urlTools2.default.parseQuery(urlParts.search) : {};
      return [route.name, params, query];
    },
    href: function href() {
      return this.toUrl.apply(this, arguments);
    },
    toUrl: function toUrl(name, params, query, fragment) {
      var pathname = this.routes[name].generate(params);
      return _urlTools2.default.combine(pathname, query, fragment);
    },
    enqueue: function enqueue(parentName, route) {
      var queues = this.queues;

      if (!parentName) queues.__absolute__.push(route);else {
        queues[parentName] || (queues[parentName] = []);
        queues[parentName].push(route);
      }
      return this;
    },
    flushQueueFor: function flushQueueFor(route) {
      var _this = this;

      var root = this.root;
      var queues = this.queues;

      var toFlush = route === root ? [queues.__absolute__, queues[route.name]] : [queues[route.name]];
      toFlush.forEach(function (queue) {
        while (queue && queue.length) {
          _this.register(queue.pop());
        }
      });
      return this;
    }
  };
}

function flattenParams(results) {
  return results.reduce(function (flattened, resultSet) {
    return flattened.concat(resultSet);
  }, []).reduce(function (params, result) {
    return Object.assign(params, result);
  }, {});
}