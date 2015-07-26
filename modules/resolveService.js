
'use strict';

var resolveCache = require('./resolveCache');
var SimpleResolve = require('./SimpleResolve');
var DependentResolve = require('./DependentResolve');
var ResolveTask = require('./ResolveTask');
var ResolveJob = require('./ResolveJob');


module.exports = resolveService;


function resolveService(Promise) {


  return {

    stateless: false,


    getCache: function () {

      return resolveCache({ stateless: this.stateless });
    },


    instantiate: function (resolveKey, state) {

      return Array.isArray(state.resolve[resolveKey])
        ? new DependentResolve(resolveKey, state)
        : new SimpleResolve(resolveKey, state);
    },


    addResolvesTo: function (state) {

      if (typeof state.resolve !== 'object') return this;

      var resolveKey;
      var resolve;

      for (resolveKey in state.resolve) {

        resolve = this.instantiate(resolveKey, state);
        state.addResolve(resolve);
      }

      return this;
    },


    createTask: function (resolve, transitionParams, resolveCache) {

      var taskParams = resolve.state.filterParams(transitionParams);

      return new ResolveTask(resolve, taskParams, resolveCache, Promise);
    },


    createJob: function (tasks, resolveCache, transition) {

      this.prepareTasks(tasks, resolveCache);

      return new ResolveJob(tasks, transition);
    },


    prepareTasks: function (tasks, resolveCache) {

      var graph = tasks
        .reduce(function (graph, task) {

          graph[task.name] = task.waitingFor;

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
      var taskName;

      for (taskName in graph) {

        visit(taskName);
      }


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

      return this;
    }

  };

}
