
'use strict';

var resolveCache = require('./resolveCache');
var SimpleResolve = require('./SimpleResolve');
var DependentResolve = require('./DependentResolve');
var ResolveTask = require('./ResolveTask');
var ResolveGraph = require('./ResolveGraph');
var ResolveJob = require('./ResolveJob');


module.exports = {

  instantiate: function (resolveKey, state) {

    return Array.isArray(state[resolveKey])
      ? new DependentResolve(resolveKey, state, resolveCache)
      : new SimpleResolve(resolveKey, state, resolveCache);
  },


  processState: function (state) {

    var resolveKey;
    var resolve;

    for (resolveKey in state.resolve) {

      resolve = this.instantiate(resolveKey, state);
      state.addResolve(resolve);
    }
  },


  createTask: function (resolve, params) {

    return new ResolveTask(resolve, params, resolveCache);
  },


  createJob: function (tasks, transition) {

    var graph = new ResolveGraph(tasks, resolveCache);
    var jobTasks = graph
      .ensureDependencies()
      .throwIfCyclic()
      .getTasks();

    return new ResolveJob(jobTasks, transition);
  }

};
