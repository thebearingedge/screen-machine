
'use strict';


module.exports = ResolveTask;


function ResolveTask(resolve, params, query, resolveCache, Promise) {

  this.resolve = resolve;
  this.id = resolve.id;
  this.params = params;
  this.query = query;
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

  if (transition.isCanceled()) {

    return this.Promise.resolve();
  }

  queue.splice(queue.indexOf(this), 1);

  return this
    .exec()
    .then(function (result) {

      this.result = result;
      complete.push(this);

      if (complete.length === wait) {

        return this.Promise.resolve();
      }

      return this.runNext(transition, queue, complete, wait);
    }.bind(this));
};


ResolveTask.prototype.runNext = function (transition, queue, complete, wait) {

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

      return ready.run(transition, queue, complete, wait);
    });

  return this.Promise.all(nextTasks);
};


ResolveTask.prototype.exec = function () {

  return new this.Promise(function (resolve, reject) {

    var resultOrPromise;

    try {

      resultOrPromise = this
        .resolve
        .execute(this.params, this.query, this.dependencies);
    }

    catch (e) {

      reject(e);
    }

    resolve(resultOrPromise);
  }.bind(this));
};


ResolveTask.prototype.commit = function () {

  this.cache.set(this.id, this.result);

  return this;
};
