'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _routeSegment = require('./route-segment');

var _routeSegment2 = _interopRequireDefault(_routeSegment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Route = (function () {
  function Route(name, path) {
    var parsers = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, Route);

    var splitNames = name.split('.');
    var parentName = splitNames[1] ? splitNames.slice(0, splitNames.length - 1).join('.') : null;
    var pathParts = (path.startsWith('/') ? path.slice(1) : path).split('/');
    var segments = pathParts.map(function (part) {
      var segment = _routeSegment2.default.create(part);
      if (segment.type === 'dynamic') {
        segment.parser = parsers[segment.key];
      }
      return segment;
    });
    var specificity = segments.map(function (segment) {
      return segment.specificity;
    }).join('');
    Object.assign(this, {
      name: name, path: path, segments: segments, specificity: specificity, parentName: parentName, parsers: parsers
    });
  }

  _createClass(Route, [{
    key: 'isAbsolute',
    value: function isAbsolute() {
      return this.path.startsWith('/');
    }
  }, {
    key: 'isSplat',
    value: function isSplat() {
      return this.path.startsWith('*');
    }
  }, {
    key: 'addChild',
    value: function addChild(route) {
      route.parent = this;
      this.children || (this.children = []);
      this.children.push(route);
    }
  }, {
    key: 'match',
    value: function match(unmatched) {
      var path = this.path;
      var segments = this.segments;

      var matched = [];
      var result = undefined;
      if (this.isSplat()) {
        var remainder = unmatched.join('/');
        var key = path.slice(1);
        result = {};
        result[key] = remainder;
        matched.push(result);
        unmatched.splice(0);
        return matched;
      }
      var toMatch = segments.length;
      var i = 0;
      while (i < toMatch && toMatch <= unmatched.length) {
        var segment = segments[i];
        // jshint -W084
        if (result = segment.match(unmatched[i])) matched.push(result);else break;
        i++;
      }
      if (matched.length < toMatch) return null;
      unmatched.splice(0, toMatch);
      return matched;
    }
  }, {
    key: 'generate',
    value: function generate(params) {
      var allSegments = [];
      var route = this;
      while (route) {
        allSegments.unshift(route.segments.slice());
        route = route.parent;
      }
      return allSegments.reduce(function (flat, routeSegments) {
        return flat.concat(routeSegments);
      }, []).map(function (segment) {
        return segment.interpolate(params);
      }).filter(function (interpolated) {
        return interpolated !== '';
      }).reduce(function (path, segment) {
        return path + '/' + segment;
      }, '') || '/';
    }
  }]);

  return Route;
})();

exports.default = Route;

Route.prototype.parent = null;
Route.prototype.children = null;