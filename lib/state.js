'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var State = (function () {
  function State(definition) {
    _classCallCheck(this, State);

    var name = definition.name;
    var path = definition.path;
    var cacheable = definition.cacheable;
    var parent = definition.parent;

    definition.cacheable = cacheable === false ? false : true;
    definition.path = path || '';
    definition.parent = parent || getParentName(name);

    var _definition$path$spli = definition.path.split('?');

    var _definition$path$spli2 = _slicedToArray(_definition$path$spli, 2);

    var pathOnly = _definition$path$spli2[0];
    var querySegment = _definition$path$spli2[1];

    var splitPath = pathOnly.split('/');
    var pathSegments = !!splitPath[0] ? splitPath : splitPath.slice(1);
    this.$definition = definition;
    this.$includes = _defineProperty({}, name, true);
    this.$ancestors = _defineProperty({}, name, this);
    this.$paramKeys = pathSegments.filter(function (anySegment) {
      return anySegment.startsWith(':');
    }).map(function (dynamicSegment) {
      return dynamicSegment.slice(1);
    });
    this.$queryKeys = querySegment ? querySegment.split('&') : [];
    Object.assign(this, definition);
  }

  _createClass(State, [{
    key: 'inheritFrom',
    value: function inheritFrom(parentNode) {
      this.data = Object.assign({}, parentNode.data, this.data || {});
      Object.assign(this.$includes, parentNode.$includes);
      Object.assign(this.$ancestors, parentNode.$ancestors);
      this.$branch = parentNode.getBranch().concat(this);
      this.$paramKeys = parentNode.$paramKeys.concat(this.$paramKeys);
      this.$parent = parentNode;
      return this;
    }
  }, {
    key: 'contains',
    value: function contains(ancestor) {
      return this.$includes[ancestor.name] || false;
    }
  }, {
    key: 'getBranch',
    value: function getBranch() {
      return this.$branch ? this.$branch.slice() : [this];
    }
  }, {
    key: 'getParent',
    value: function getParent() {
      return this.$parent;
    }
  }, {
    key: 'getAncestor',
    value: function getAncestor(stateName) {
      return this.$ancestors[stateName];
    }
  }, {
    key: 'addResolve',
    value: function addResolve(resolve) {
      this.$resolves || (this.$resolves = []);
      this.$resolves.push(resolve);
      return this;
    }
  }, {
    key: 'getResolves',
    value: function getResolves() {
      return (this.$resolves || []).slice();
    }
  }, {
    key: 'filterParams',
    value: function filterParams(params) {
      return this.$paramKeys.reduce(function (own, key) {
        return Object.assign(own, _defineProperty({}, key, params[key]));
      }, {});
    }
  }, {
    key: 'isStale',
    value: function isStale(oldParams, oldQuery, newParams, newQuery) {
      var $paramKeys = this.$paramKeys;
      var $queryKeys = this.$queryKeys;

      var params = $paramKeys.some(function (key) {
        return newParams[key] !== oldParams[key];
      });
      var query = $queryKeys.some(function (key) {
        return newQuery[key] !== oldQuery[key];
      });
      return params || query;
    }
  }, {
    key: 'sleep',
    value: function sleep() {
      var $views = this.$views;
      var $resolves = this.$resolves;

      $views && $views.forEach(function (view) {
        return view.detach();
      });
      $resolves && $resolves.forEach(function (resolve) {
        return resolve.clear();
      });
      return this;
    }
  }, {
    key: 'addView',
    value: function addView(view) {
      this.$views || (this.$views = []);
      this.$views.push(view);
      return this;
    }
  }, {
    key: 'getViews',
    value: function getViews() {
      return (this.$views || []).slice();
    }
  }, {
    key: 'addComponent',
    value: function addComponent(component) {
      this.$components || (this.$components = []);
      this.$components.push(component);
      return this;
    }
  }, {
    key: 'getComponents',
    value: function getComponents() {
      return (this.$components || []).slice().reverse();
    }
  }, {
    key: 'getAllComponents',
    value: function getAllComponents() {
      return this.getBranch().reverse().reduce(function (all, state) {
        return all.concat(state.getComponents());
      }, []);
    }
  }, {
    key: 'shouldResolve',
    value: function shouldResolve(cache) {
      var $resolves = this.$resolves;
      var cacheable = this.cacheable;

      if (!$resolves) return false;
      if (!cacheable) return true;
      return $resolves.some(function (resolve) {
        return !cache.has(resolve.id);
      });
    }
  }]);

  return State;
})();

exports.default = State;

State.prototype.$parent = null;
State.prototype.$branch = null;
State.prototype.$resolves = null;
State.prototype.$views = null;
State.prototype.$components = null;

function getParentName(stateName) {
  return stateName.split('.').reverse().slice(1).reverse().join('.') || null;
}