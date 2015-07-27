
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


ResolveTask.prototype.$dependencies = undefined;


ResolveTask.prototype.isWaitingFor = function isWaitingFor(dep) {

  return this.waitingFor.indexOf(dep) > -1;
};


ResolveTask.prototype.setDependency = function setDependency(dep, result) {

  this.$dependencies || (this.$dependencies = {});
  this.$dependencies[dep] = result;
  this.waitingFor.splice(this.waitingFor.indexOf(dep), 1);

  return this;
};


ResolveTask.prototype.isReady = function isReady() {

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
        .execute(self.params, self.$dependencies);
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
      .filter(function (task) {

        return task.isWaitingFor(self.id);
      })
      .map(function (dependent) {

        return dependent.setDependency(self.id, self.result);
      })
      .filter(function (queued) {

        return queued.isReady();
      })
      .map(function (task) {

        return task.execute(queue, wait, complete, transition);
      });

    return next.length
      ? Promise.all(next)
      : Promise.resolve();
  });
};


ResolveTask.prototype.commit = function commit() {

  this.cache.set(this.id, this.result);

  return this;
};