
'use strict';

module.exports = ResolveGraph;


function ResolveGraph(resolves, resolveCache) {

  this.cache = resolveCache;
  this.resolves = resolves;
  this.graph = resolves
    .reduce(function (graph, resolve) {

      graph[resolve.name] = resolve.waitingFor;

      return graph;
    }, {});
}


ResolveGraph.prototype.ensureDependencies = function () {

  var graph = this.graph;
  var cache = this.cache;

  this.resolves.forEach(function (resolve) {

    return resolve
      .waitingFor
      .filter(function (dependency) {

        return !(dependency in graph);
      })
      .forEach(function (absent) {

         var cached = cache.get(absent);

         return resolve.setInjectable(absent, cached);
      });
  });

  return this;
};


ResolveGraph.prototype.throwIfCyclic = function () {

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


ResolveGraph.prototype.getResolves = function () {

  return this.resolves;
};
