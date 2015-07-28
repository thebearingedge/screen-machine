
'use strict';

module.exports = ResolveTask;


function ResolveTask(resolve, params, resolveCache, Promise) {

  this.resolve = resolve;
  this.id = resolve.id;
  this.params = params;
  this.cache = resolveCache;
  this.Promise = Promise;
  this.waitingFor = resolve.injectables
    ? resolve.injectables.slice()
    : [];
}


ResolveTask.prototype.dependencies = undefined;


ResolveTask.prototype.isWaitingFor = function (dependencyId) {

  return this.waitingFor.indexOf(dependencyId) > -1;
};


ResolveTask.prototype.setDependency = function (dependencyId, result) {

  this.dependencies || (this.dependencies = {});
  this.dependencies[dependencyId] = result;
  this.waitingFor.splice(this.waitingFor.indexOf(dependencyId), 1);

  return this;
};


ResolveTask.prototype.isReady = function () {

  return !this.waitingFor.length;
};


ResolveTask.prototype.run = function (transition, queue, complete, wait) {

  var Promise = this.Promise;

  if (transition.isSuperceded()) {

    return Promise.resolve();
  }

  queue.splice(queue.indexOf(this), 1);

  var self = this;

  return new Promise(function (resolve, reject) {

    var resultOrPromise;

    try {

      resultOrPromise = self
        .resolve
        .execute(self.params, self.dependencies);
    }
    catch (e) {

      reject(e);
    }

    resolve(resultOrPromise);
  })
  .then(function (result) {

    self.result = result;
    complete.push(self);

    if (complete.length === wait) {

      return Promise.resolve();
    }

    return self.runNext(transition, queue, complete, wait);
  });
};


ResolveTask.prototype.runNext = function (transition, queue, complete, wait) {

  var self = this;

  var next = queue
    .filter(function (waiting) {

      return waiting.isWaitingFor(self.id);
    })
    .map(function (dependent) {

      return dependent.setDependency(self.id, self.result);
    })
    .filter(function (dependent) {

      return dependent.isReady();
    })
    .map(function (ready) {

      return ready.run(transition, queue, complete, wait);
    });

  return self.Promise.all(next);
};


ResolveTask.prototype.commit = function () {

  this.cache.set(this.id, this.result);

  return this;
};