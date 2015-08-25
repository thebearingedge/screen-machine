
'use strict';

module.exports = Transition;


function Transition(machine, toState, toParams, toQuery, options) {

  options || (options = {});

  this._machine = machine;
  this.toState = toState;
  this.toParams = toParams;
  this.toQuery = toQuery;
  this.fromState = machine.$state.current;
  this.fromParams = machine.$state.params;
  this.fromQuery = machine.$state.query;
}


Transition.prototype._canceled = false;
Transition.prototype._succeeded = false;
Transition.prototype._tasks = null;


Transition.prototype.isCanceled = function () {

  if (this._succeeded) return false;
  return this._canceled;
};


Transition.prototype.isSuperseded = function () {

  return this !== this._machine.transition;
};


Transition.prototype.isSuccessful = function () {

  return this._succeeded && !this.isSuperseded();
};


Transition.prototype.cancel = function () {

  if (!this._succeeded) {

    this._canceled = true;
  }

  return this;
};


Transition.prototype._cleanup = function () {

  this
    ._exiting
    .forEach(function (exited) {

      exited.sleep();
    });

  return this;
};


Transition.prototype.redirect = function () {

  return this._machine.transitionTo.apply(this._machine, arguments);
};


Transition.prototype.retry = function () {

  return this.redirect(this.toState, this.toParams, this.toQuery);
};


Transition.prototype._prepare = function (resolves, cache, exiting, Promise) {

  var tasks = this._tasks = resolves
    .map(function (resolve) {

      return resolve.createTask(this.toParams, this.toQuery, this, cache);
    }, this);
  this._cache = cache;
  this._exiting = exiting;
  this._Promise = Promise;

  if (!tasks.length) return this;

  var graph = tasks
    .reduce(function (graph, task) {

      graph[task.id] = task.waitingFor;

      return graph;
    }, {});

  tasks
    .filter(function (task) {

      return !task.isReady();
    })
    .forEach(function (notReady) {

      notReady
        .waitingFor
        .filter(function (dependency) {

          return !(dependency in graph);
        })
        .forEach(function (absent) {

          var cached = cache.get(absent);

          notReady.setDependency(absent, cached);
        });
    });

  var VISITING = 1;
  var OK = 2;
  var visited = {};
  var stack = [];
  var taskId;

  for (taskId in graph) {

    visit(taskId);
  }

  return this;


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
};


Transition.prototype._attempt = function () {

  if (this.isCanceled()) {

    return this._fail('transition canceled');
  }

  if (this.isSuperseded()) {

    return this._fail('transition superseded');
  }

  var queue = this._tasks.slice();
  var wait = queue.length;
  var completed = [];
  var toRun = queue
    .filter(function (task) {

      return task.isReady();
    })
    .map(function (ready) {

      return ready.runSelf(queue, completed, wait);
    }, this);

  return this._Promise.all(toRun)
    .then(function () {

      return this._succeed();
    }.bind(this));
};


Transition.prototype._fail = function (reason) {

  return this._Promise.reject(new Error(reason));
};


Transition.prototype._succeed = function () {

  this._succeeded = true;

  return this._Promise.resolve(this);
};


Transition.prototype._commit = function () {

  this._machine.init(this.toState, this.toParams, this.toQuery);

  this._tasks.forEach(function (task) {

    this._cache.set(task.id, task.result);
  }, this);

  return this;
};
