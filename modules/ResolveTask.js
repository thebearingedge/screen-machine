
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


ResolveTask.prototype.isWaitingFor = function (dep) {

  return this.waitingFor.indexOf(dep) > -1;
};


ResolveTask.prototype.setDependency = function (dep, result) {

  this.dependencies || (this.dependencies = {});
  this.dependencies[dep] = result;
  this.waitingFor.splice(this.waitingFor.indexOf(dep), 1);

  return this;
};


ResolveTask.prototype.isReady = function () {

  return !this.waitingFor.length;
};


ResolveTask.prototype.execute = function (queue, wait, complete, transition) {

  var Promise = this.Promise;
  var self = this;

  if (transition.isSuperceded()) {

    return Promise.resolve();
  }

  queue.splice(queue.indexOf(self), 1);

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

    var next = queue
      .filter(function (queued) {

        return queued.isWaitingFor(self.id);
      })
      .map(function (dependent) {

        return dependent.setDependency(self.id, self.result);
      })
      .filter(function (dependent) {

        return dependent.isReady();
      })
      .map(function (ready) {

        return ready.execute(queue, wait, complete, transition);
      });

    return Promise.all(next);
  });
};


ResolveTask.prototype.commit = function () {

  this.cache.set(this.id, this.result);

  return this;
};