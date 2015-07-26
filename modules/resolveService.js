
'use strict';

var resolveCache = require('./resolveCache');
var SimpleResolve = require('./SimpleResolve');
var DependentResolve = require('./DependentResolve');
var ResolveTask = require('./ResolveTask');
var ResolveGraph = require('./ResolveGraph');
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


    processState: function (state) {

      if (typeof state.resolve !== 'object') return this;

      var resolveKey;
      var resolve;

      for (resolveKey in state.resolve) {

        resolve = this.instantiate(resolveKey, state);
        state.addResolve(resolve);
      }

      return this;
    },


    createTask: function (resolve, params, resolveCache) {

      var ownParams = resolve.state.filterParams(params);

      return new ResolveTask(resolve, ownParams, resolveCache, Promise);
    },


    createJob: function (tasks, resolveCache, transition) {

      var graph = new ResolveGraph(tasks, resolveCache);
      var jobTasks = graph
        .ensureDependencies()
        .throwIfCyclic()
        .getTasks();

      return new ResolveJob(jobTasks, transition);
    }

  };

}
