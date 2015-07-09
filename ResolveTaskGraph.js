
'use strict';

module.exports = ResolveTaskGraph;


function ResolveTaskGraph(tasks, resolveCache) {

  this.cache = resolveCache;
  this.tasks = tasks;
  this.graph = tasks
    .reduce(function (graph, task) {

      graph[task.name] = task.waitingFor;

      return graph;
    }, {});
}


ResolveTaskGraph.prototype.ensureDependencies = function () {

  var graph = this.graph;
  var cache = this.cache;

  this.tasks.forEach(function (task) {

    return task
      .waitingFor
      .filter(function (dependency) {

        return !(dependency in graph);
      })
      .forEach(function (absent) {

         var cached = cache.get(absent);

         return task.setInjectable(absent, cached);
      });
  });

  return this;
};


ResolveTaskGraph.prototype.throwIfCyclic = function () {

  var graph = this.graph;
  var IN_PROGRESS = 1;
  var DONE = 2;
  var visited = {};
  var stack = [];
  var key;

  for (key in graph) {

    visit(key);
  }

  return this;


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


ResolveTaskGraph.prototype.getTasks = function () {

  return this.tasks;
};
