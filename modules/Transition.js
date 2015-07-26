
'use strict';


module.exports = Transition;


function Transition(from, to, params, resolveService, machine) {

  var exiting = getExiting(from, to);
  var pivotState = exiting[0].getParent();
  var toBranch = to.getBranch();
  var entering = toBranch.slice(toBranch.indexOf(pivotState) + 1);
  var resolveCache = resolveService.getCache();
  var resolveTasks = getTasks(toBranch, params, resolveService, resolveCache);
  var resolveJob = resolveTasks.length
    ? resolveService.createJob(resolveTasks, resolveCache, this)
    : null;

  this.Promise = resolveService.Promise;
  this.params = params;
  this.machine = machine;
  this.resolveCache = resolveCache;
  this.resolveJob = resolveJob;
  this.entering = entering;
  this.exiting = exiting;
}


Transition.prototype.superceded = false;


Transition.prototype.isSuperceded = function isSuperceded() {

  return (this.superceded = (this !== this.machine.transition));
};


Transition.prototype.attempt = function attempt() {

  var resolveJob = this.resolveJob;

  var results = {
    resolveCache: this.resolveCache,
    entering: this.entering,
    exiting: this.exiting
  };

  if (!resolveJob) {

    results.tasks = [];

    return this.Promise.resolve(results);
  }

  return new this.Promise(function (resolve, reject) {

    resolveJob.start(function (err, completed) {

      if (err) return reject(err);

      if (!completed) return reject(null);

      results.tasks = completed;

      return resolve(results);
    });
  });
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
