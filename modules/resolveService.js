
'use strict';

var resolveCache = require('./resolveCache');
var SimpleResolve = require('./SimpleResolve');
var DependentResolve = require('./DependentResolve');
var ResolveTask = require('./ResolveTask');


module.exports = resolveService;


function resolveService(Promise) {

  return {

    Promise: Promise,


    stateless: false,


    getCache: function () {

      return resolveCache({ stateless: this.stateless });
    },


    instantiate: function (resolveKey, state) {

      var cache = resolveCache({ stateless: this.stateless });

      return Array.isArray(state.resolve[resolveKey])
        ? new DependentResolve(resolveKey, state, cache)
        : new SimpleResolve(resolveKey, state, cache);
    },


    addResolvesTo: function (state) {

      if (state.resolve != null && typeof state.resolve === 'object') {

        Object
          .keys(state.resolve)
          .forEach(function (resolveKey) {

            var resolve = this.instantiate(resolveKey, state);
            state.addResolve(resolve);
          }, this);
      }

      return this;
    },


    createTask: function (resolve, params, query, resolveCache) {

      var taskParams = resolve.state.filterParams(params);

      return new ResolveTask(resolve, taskParams, query, resolveCache, Promise);
    },


    runTasks: function (tasks, resolveCache, transition) {

      if (!tasks.length) {

        return Promise.all([]);
      }

      this.prepareTasks(tasks, resolveCache);

      var queue = tasks.slice();
      var complete = [];
      var wait = queue.length;

      var runTasks = queue
        .filter(function (task) {

          return task.isReady();
        })
        .map(function (ready) {

          return ready.run(transition, queue, complete, wait);
        });

      return Promise.all(runTasks)
        .then(function () {

          return Promise.resolve(complete);
        });
    },


    prepareTasks: function (tasks, resolveCache) {

      var graph = tasks
        .reduce(function (graph, task) {

          graph[task.id] = task.waitingFor;

          return graph;
        }, {});

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

              var cached = resolveCache.get(absent);

              dependent.setDependency(absent, cached);
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
    }

  };
}
