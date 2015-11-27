'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseResolve = (function () {
  function BaseResolve(resolveKey, state, Promise) {
    _classCallCheck(this, BaseResolve);

    this.key = resolveKey;
    this.id = resolveKey + '@' + state.name;
    this.Promise = Promise;
    this.cacheable = state.cacheable === false ? false : true;
  }

  _createClass(BaseResolve, [{
    key: 'clear',
    value: function clear() {
      var cache = this.cache;
      var cacheable = this.cacheable;
      var id = this.id;

      if (cache && cacheable) cache.unset(id);
    }
  }, {
    key: 'createTask',
    value: function createTask(params, query, transition, cache) {
      Object.assign(this, { cache: cache });
      var id = this.id;
      var Promise = this.Promise;
      var _injectables = this.injectables;
      var injectables = _injectables === undefined ? [] : _injectables;
      var taskDelegate = this.taskDelegate;

      return Object.assign({ resolve: this }, taskDelegate, {
        id: id, Promise: Promise, params: params, query: query, transition: transition, cache: cache
      }, { waitingFor: injectables.slice() });
    }
  }]);

  return BaseResolve;
})();

exports.default = BaseResolve;

BaseResolve.prototype.taskDelegate = {
  isWaitingFor: function isWaitingFor(dependencyId) {
    return this.waitingFor.indexOf(dependencyId) > -1;
  },
  isReady: function isReady() {
    return !this.waitingFor.length;
  },
  setDependency: function setDependency(dependencyId, result) {
    this.dependencies || (this.dependencies = {});
    this.dependencies[dependencyId] = result;
    this.waitingFor.splice(this.waitingFor.indexOf(dependencyId), 1);
    return this;
  },
  perform: function perform() {
    var _this = this;

    var Promise = this.Promise;
    var params = this.params;
    var query = this.query;
    var transition = this.transition;
    var dependencies = this.dependencies;

    return new Promise(function (resolve, reject) {
      var resultOrPromise = undefined;
      try {
        resultOrPromise = _this.resolve.execute(params, query, transition, dependencies);
      } catch (e) {
        reject(e);
      }
      resolve(resultOrPromise);
    });
  },
  runSelf: function runSelf(queue, completed, wait) {
    var _this2 = this;

    var Promise = this.Promise;
    var transition = this.transition;

    if (queue.indexOf(this) < 0) return Promise.resolve();
    if (transition.isSuperseded()) {
      queue.splice(0);
      return transition._fail('transition superseded');
    }
    queue.splice(queue.indexOf(this), 1);
    return this.perform().then(function (result) {
      _this2.result = result;
      completed.push(_this2);
      if (completed.length === wait) return Promise.resolve();
      return _this2.runDependents(queue, completed, wait);
    });
  },
  runDependents: function runDependents(queue, completed, wait) {
    var id = this.id;
    var result = this.result;
    var Promise = this.Promise;

    var nextTasks = queue.filter(function (queued) {
      return queued.isWaitingFor(id);
    }).map(function (dependent) {
      return dependent.setDependency(id, result);
    }).filter(function (maybeReady) {
      return maybeReady.isReady();
    }).map(function (ready) {
      return ready.runSelf(queue, completed, wait);
    });
    return Promise.all(nextTasks);
  },
  commit: function commit() {
    this.cache.set(this.id, this.result);
  }
};