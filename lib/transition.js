'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Transition = (function () {
  function Transition(_machine, toState, toParams, toQuery) {
    _classCallCheck(this, Transition);

    var $state = _machine.$state;
    var fromState = $state.current;
    var fromParams = $state.params;
    var fromQuery = $state.query;

    Object.assign(this, {
      _machine: _machine, fromState: fromState, fromParams: fromParams, fromQuery: fromQuery, toState: toState, toParams: toParams, toQuery: toQuery,
      _canceled: false, _succeeded: false, _tasks: null
    });
  }

  _createClass(Transition, [{
    key: 'isCanceled',
    value: function isCanceled() {
      return !this._succeeded && this._canceled;
    }
  }, {
    key: 'isSuperseded',
    value: function isSuperseded() {
      return this !== this._machine.transition;
    }
  }, {
    key: 'isSuccessful',
    value: function isSuccessful() {
      return this._succeeded && !this.isSuperseded();
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      !this._succeeded && (this._canceled = true);
      return this;
    }
  }, {
    key: 'retry',
    value: function retry() {
      return this.redirect(this.toState, this.toParams, this.toQuery);
    }
  }, {
    key: 'redirect',
    value: function redirect() {
      var _machine2;

      return (_machine2 = this._machine).transitionTo.apply(_machine2, arguments);
    }
  }, {
    key: '_attempt',
    value: function _attempt() {
      var _this = this;

      if (this.isCanceled()) return this._fail('transition canceled');
      if (this.isSuperseded()) return this._fail('transition superseded');
      var _tasks = this._tasks;
      var _Promise = this._Promise;

      var queue = _tasks.slice();
      var wait = queue.length;
      var completed = [];
      var toRun = queue.filter(function (task) {
        return task.isReady();
      }).map(function (ready) {
        return ready.runSelf(queue, completed, wait);
      });
      return _Promise.all(toRun).then(function () {
        return _this._succeed();
      });
    }
  }, {
    key: '_fail',
    value: function _fail(reason) {
      return this._Promise.reject(new Error(reason));
    }
  }, {
    key: '_succeed',
    value: function _succeed() {
      this._succeeded = true;
      return this._Promise.resolve(this);
    }
  }, {
    key: '_commit',
    value: function _commit() {
      var _machine = this._machine;
      var toState = this.toState;
      var toParams = this.toParams;
      var toQuery = this.toQuery;
      var _tasks = this._tasks;
      var _cache = this._cache;

      _machine.init(toState, toParams, toQuery);
      _tasks.forEach(function (task) {
        return _cache.set(task.id, task.result);
      });
      return this;
    }
  }, {
    key: '_cleanup',
    value: function _cleanup() {
      this._exiting.forEach(function (exited) {
        return exited.sleep();
      });
      return this;
    }
  }, {
    key: '_prepare',
    value: function _prepare(resolves, _cache, _exiting, _Promise) {
      var _this2 = this;

      var toParams = this.toParams;
      var toQuery = this.toQuery;

      var _tasks = resolves.map(function (resolve) {
        return resolve.createTask(toParams, toQuery, _this2, _cache);
      });
      Object.assign(this, { _tasks: _tasks, _cache: _cache, _exiting: _exiting, _Promise: _Promise });
      if (!_tasks.length) return this;
      var graph = _tasks.reduce(function (graph, task) {
        graph[task.id] = task.waitingFor;
        return graph;
      }, {});
      _tasks.filter(function (task) {
        return !task.isReady();
      }).forEach(function (notReady) {
        notReady.waitingFor.filter(function (dependency) {
          return !(dependency in graph);
        }).forEach(function (absent) {
          notReady.setDependency(absent, _cache.get(absent));
        });
      });
      assertAcyclic(graph);
      return this;
    }
  }]);

  return Transition;
})();

exports.default = Transition;

function assertAcyclic(graph) {

  var VISITING = 1;
  var OK = 2;
  var visited = {};
  var stack = [];

  Object.keys(graph).forEach(visit);

  function visit(taskId) {
    if (visited[taskId] === OK) return;
    stack.push(taskId);
    if (visited[taskId] === VISITING) {
      stack.splice(0, stack.indexOf(taskId));
      throw new Error('Cyclic resolve dependency: ' + stack.join(' -> '));
    }
    visited[taskId] = VISITING;
    graph[taskId].forEach(visit);
    stack.pop();
    visited[taskId] = OK;
  }
}