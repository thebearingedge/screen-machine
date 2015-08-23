
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


Transition.prototype.error = null;
Transition.prototype._canceled = false;
Transition.prototype._succeeded = false;
Transition.prototype._handled = null;
Transition.prototype._tasks = null;


Transition.prototype.setError = function (err) {

  this._canceled = true;
  this._handled = false;
  this.error = err;
  return this;
};


Transition.prototype.errorHandled = function () {

  this._handled = true;
  return this;
};


Transition.prototype.isHandled = function () {

  return this._handled;
};


Transition.prototype.isCanceled = function () {

  if (this._succeeded) return false;

  if (!this._canceled && this !== this._machine.transition) {

    this._canceled = true;
  }

  return this._canceled;
};


Transition.prototype.isSuccessful = function () {

  return this._succeeded;
};


Transition.prototype.cancel = function () {

  this._canceled = true;

  return this;
};


Transition.prototype._finish = function () {

  this._succeeded = true;
  this._machine.init(this.toState, this.toParams, this.toQuery);
  this._tasks.forEach(function (task) { return task.commit(); });
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


Transition.prototype.prepare = function (resolves, cache, exiting, Promise) {

  var tasks = this._tasks = resolves
    .map(function (resolve) {

      return resolve.createTask(this.toParams, this.toQuery, this, cache);
    }, this);
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


Transition.prototype.attempt = function () {

  var Promise = this._Promise;
  var queue = this._tasks.slice();
  var wait = queue.length;
  var completed = [];
  var toRun = queue
    .filter(function (task) {

      return task.isReady();
    })
    .map(function (ready) {

      return ready.runSelf(this, queue, completed, wait);
    }, this);

  return Promise.all(toRun)
    .then(function () {

      return this;
    }.bind(this));
};
