
'use strict';

var assign = require('object-assign');

module.exports = BaseResolve;


function BaseResolve(resolveKey, state, Promise) {

  this.key = resolveKey;
  this.id = resolveKey + '@' + state.name;
  this.Promise = Promise;
  this.cacheable = state.cacheable === false
    ? false
    : true;
}


BaseResolve.prototype.clear = function () {

  if (this.cacheable) {

    this.cache.unset(this.id);
  }
};


BaseResolve.prototype.createTask = function (params, query, transition, cache) {

  this.cache = cache;

  return assign({}, this.taskDelegate, {
    id: this.id,
    resolve: this,
    Promise: this.Promise,
    waitingFor: this.injectables
      ? this.injectables.slice()
      : [],
    params: params,
    query: query,
    transition: transition,
    cache: cache
  });
};


BaseResolve.prototype.taskDelegate = {

  isWaitingFor: function (dependencyId) {

    return this.waitingFor.indexOf(dependencyId) > -1;
  },


  isReady: function () {

    return !this.waitingFor.length;
  },


  setDependency: function (dependencyId, result) {

    this.dependencies || (this.dependencies = {});
    this.dependencies[dependencyId] = result;
    this.waitingFor.splice(this.waitingFor.indexOf(dependencyId), 1);
    return this;
  },


  perform: function () {

    return new this.Promise(function (resolve, reject) {

      var resultOrPromise;

      try {
        resultOrPromise = this
          .resolve
          .execute(this.params, this.query, this.transition, this.dependencies);
      }
      catch (e) {

        return reject(e);
      }

      return resolve(resultOrPromise);
    }.bind(this));
  },


  runSelf: function (queue, completed, wait) {

    var Promise = this.Promise;

    if (this.transition.isCanceled()) {

      return Promise.resolve();
    }

    queue.splice(queue.indexOf(this), 1);

    return this
      .perform()
      .then(function (result) {

        this.result = result;
        completed.push(this);

        if (completed.length === wait) {

          return Promise.resolve();
        }

        return this.runDependents(queue, completed, wait);
      }.bind(this));
  },


  runDependents: function (queue, completed, wait) {

    var nextTasks = queue
      .filter(function (queued) {

        return queued.isWaitingFor(this.id);
      }, this)
      .map(function (dependent) {

        return dependent.setDependency(this.id, this.result);
      }, this)
      .filter(function (maybeReady) {

        return maybeReady.isReady();
      })
      .map(function (ready) {

        return ready.runSelf(queue, completed, wait);
      });

    return this.Promise.all(nextTasks);
  },


  commit: function () {
    this.cache.set(this.id, this.result);
  }

};
