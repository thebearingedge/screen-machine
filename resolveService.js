
'use strict';

var resolveCache = require('./resolveCache');
var SimpleResolve = require('./SimpleResolve');
var DependentResolve = require('./DependentResolve');
var ResolveTask = require('./ResolveTask');
var ResolveGraph = require('./ResolveGraph');
var ResolveJob = require('./ResolveJob');


module.exports = {

  instantiate: function (resolveKey, stateNode) {

    return Array.isArray(stateNode[resolveKey])
      ? new DependentResolve(resolveKey, stateNode, resolveCache)
      : new SimpleResolve(resolveKey, stateNode, resolveCache);
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
