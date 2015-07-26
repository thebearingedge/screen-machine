
'use strict';


module.exports = Transition;


function Transition(from, to, params, resolveService, machine) {

  var exiting = getExiting(from, to);
  var pivot = exiting[0].getParent();
  var toBranch = to.getBranch();
  var entering = toBranch.slice(toBranch.indexOf(pivot) + 1);
  var resolveCache = resolveService.getCache();
  var resolveTasks = getTasks(toBranch, params, resolveService, resolveCache);
  var resolveJob = resolveService.createJob(resolveTasks, resolveCache, this);

  this.params = params;
  this.machine = machine;
  this.resolveCache = resolveCache;
  this.resolveJob = resolveJob;
  this.entering = entering;
  this.exiting = exiting;
}


Transition.prototype.superceded = false;


Transition.prototype.isSuperceded = function () {

  return (this.superceded = (this !== this.machine.transition));
};


Transition.prototype.attempt = function () {


};


function getExiting(fromState, toState) {

  return fromState
    .getBranch()
    .filter(function (state) {

      return !toState.contains(state.name);
    });
}


function getTasks(toBranch, toParams, resolveService, resolveCache) {

  return toBranch
    .filter(function (state) {

      return state.isStale(toParams);
    })
    .reduce(function (resolves, state) {

      return resolves.concat(state.getResolves());
    }, [])
    .map(function (resolve) {

      return resolveService.createTask(resolve, toParams, resolveCache);
    });
}
