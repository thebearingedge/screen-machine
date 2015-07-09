
'use strict';

module.exports = ResolveQueue;


function ResolveQueue(router, resolveCache) {

  var currentTransition = router.transition;

  this.cache = resolveCache;
  this.cancel = false;
  this.wait = 0;
  this.queue = [];
  this.completed = [];

  this.isSuperceded = function () {

    return currentTransition !== router.transition;
  };
}


ResolveQueue.prototype.onComplete = function (callback) {

  this.successHandler = callback;

  return this;
};


ResolveQueue.prototype.onError = function (callback) {

  this.errorHandler = callback;

  return this;
};


ResolveQueue.prototype.enqueue = function (resolves) {

  this.queue = this.queue.concat(resolves);
};


ResolveQueue.prototype.start = function () {

  var graph = this.getDependencyGraph();

  this.ensureDependencies(graph);
  this.throwIfCyclic(graph);
  this.wait = this.queue.length;

  var self = this;

  return self
    .queue
    .filter(function (resolve) {

      return resolve.isReady();
    })
    .forEach(function (ready) {

      return self.run(ready);
    });
};


ResolveQueue.prototype.getDependencyGraph = function () {

  return this
    .resolves
    .reduce(function (graph, resolve) {

      graph[resolve.name] = resolve.waitingFor;

      return graph;
    }, {});
};


ResolveQueue.prototype.ensureDependencies = function (graph) {

  var cache = this.cache;

  this.queue.forEach(function (resolve) {

    return resolve
      .waitingFor
      .filter(function (dependency) {

        return !(dependency in graph);
      })
      .forEach(function (absent) {

         var injectable = cache.get(absent);

         return resolve.setInjectable(absent, injectable);
      });
  });
};


ResolveQueue.prototype.throwIfCyclic = function (graph) {

  var IN_PROGRESS = 1;
  var DONE = 2;
  var visited = {};
  var stack = [];
  var key;


  for (key in graph) {

    visit(key);
  }


  function visit(key) {

    if (visited[key] === DONE) return;

    stack.push(key);

    if (visited[key] === IN_PROGRESS) {

      stack.splice(0, stack.indexOf(key));

      throw new Error('Cyclic dependency: ' + stack.join(' -> '));
    }

    visited[key] = IN_PROGRESS;

    graph[key].forEach(visit);

    stack.pop();
    visited[key] = DONE;
  }
};


ResolveQueue.prototype.run = function (resolve) {

  var self = this;

  return self
    .dequeue(resolve)
    .execute()
    .then(function (result) {

      if (self.cancel) return;

      if (self.isSuperceded()) {

        return self.abort();
      }

      resolve.result = result;
      self.completed.push(resolve);

      return --self.wait
        ? self.runDependentsOf(resolve)
        : self.finish();
    })
    .catch(function (err) {

      return self.abort(err);
    });
};


ResolveQueue.prototype.dequeue = function (resolve) {

  return this.queue.splice(this.queue.indexOf(resolve), 1);
};


ResolveQueue.prototype.abort = function (err) {

  this.cancel = true;

  if (err) this.errorHandler.call(null, err);
};


ResolveQueue.prototype.runDependentsOf = function (resolve) {

  var self = this;

  return self
    .queue
    .filter(function (remaining) {

      return remaining.isDependentOn(resolve.name);
    })
    .forEach(function (dependent) {

      return dependent
        .setInjectable(resolve.name, resolve.result)
        .isReady()
          ? self.run(dependent)
          : undefined;
    });
};


ResolveQueue.prototype.finish = function () {

  var completed = this
    .completed
    .map(function (resolve) {

      return resolve.commit();
    });

  return this.successHandler.call(null, completed);
};
