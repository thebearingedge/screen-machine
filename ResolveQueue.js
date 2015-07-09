
'use strict';

module.exports = ResolveQueue;


function ResolveQueue(resolves) {

  this.cancel = false;
  this.wait = 0;
  this.resolves = resolves;
  this.completed = [];
}


ResolveQueue.prototype.setTransition = function (router) {

  this.router = router;
  this.transition = router.transition;

  return this;
};


ResolveQueue.prototype.onComplete = function (callback) {

  this.successHandler = callback;

  return this;
};


ResolveQueue.prototype.onAbort = function (callback) {

  this.abortHandler = callback;

  return this;
};


ResolveQueue.prototype.start = function () {

  this.wait = this.resolves.length;

  var self = this;

  return self
    .resolves
    .filter(function (resolve) {

      return resolve.isReady();
    })
    .forEach(function (ready) {

      return self.run(ready);
    });
};


ResolveQueue.prototype.run = function (resolve) {

  var self = this;

  return self
    .dequeue(resolve)
    .execute()
    .then(function (result) {

      if (self.cancel) return;

      if (self.isSuperceded()) {

        return self.abort();
      }

      resolve.result = result;
      self.completed.push(resolve);

      return --self.wait
        ? self.runDependentsOf(resolve)
        : self.finish();
    })
    .catch(function (err) {

      return self.abort(err);
    });
};


ResolveQueue.prototype.dequeue = function (resolve) {

  return this.resolves.splice(this.resolves.indexOf(resolve), 1);
};


ResolveQueue.prototype.isSuperceded = function () {

  return this.transition !== this.router.transition;
};


ResolveQueue.prototype.abort = function (err) {

  this.cancel = true;

  if (err) this.abortHandler.call(null, err);
};


ResolveQueue.prototype.runDependentsOf = function (resolve) {

  var self = this;

  return self
    .resolves
    .filter(function (remaining) {

      return remaining.isDependentOn(resolve.name);
    })
    .forEach(function (dependent) {

      return dependent
        .setInjectable(resolve.name, resolve.result)
        .isReady()
          ? self.run(dependent)
          : undefined;
    });
};


ResolveQueue.prototype.finish = function () {

  return this.successHandler.call(null, this.completed);
};
