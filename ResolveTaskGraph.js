
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

  var tasks = this.tasks;
  var graph = this.graph;
  var cache = this.cache;

  tasks
    .filter(function (task) {

      return !task.isReady();
    })
    .forEach(function (dependent) {

      dependent
        .waitingFor
        .filter(function (dependency) {

          return !(dependency in graph);
        })
        .forEach(function (absent) {

          dependent.setInjectable(absent, cache.get(absent));
        });
    });

  return this;
};


ResolveTaskGraph.prototype.throwIfCyclic = function () {

  var graph = this.graph;
  var VISITING = 1;
  var OK = 2;
  var visited = {};
  var stack = [];
  var taskName;

  for (taskName in graph) {

    visit(taskName);
  }

  return this;


  function visit(taskName) {

    if (visited[taskName] === OK) return;

    stack.push(taskName);

    if (visited[taskName] === VISITING) {

      stack.splice(0, stack.indexOf(taskName));

      throw new Error('Cyclic resolve dependency: ' + stack.join(' -> '));
    }

    visited[taskName] = VISITING;

    graph[taskName].forEach(visit);

    stack.pop();
    visited[taskName] = OK;
  }
};


ResolveTaskGraph.prototype.getTasks = function () {

  return this.tasks;
};
