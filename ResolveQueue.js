
'use strict';

module.exports = ResolveQueue;


function ResolveQueue(resolves) {

  this._wait = resolves.length;
  this._resolves = resolves;
  this._completed = [];
  this.Promise = ResolveQueue.Promise;
}

ResolveQueue.prototype.start = function () {

  var self = this;

  return self
    ._resolves
    .filter(function (resolve) {

      return resolve.isReady();
    })
    .forEach(function (ready) {

      return self._run(ready);
    });
};


ResolveQueue.prototype._run = function (resolve) {

  var self = this;

  self._dequeue(resolve);

  var resultOrPromise = resolve.execute();

  return self
    .Promise
    .resolve(resultOrPromise)
    .then(function (result) {

      resolve.result = result;
      self._completed.push(resolve);

      return --self._wait
        ? self._runDependentsOf(resolve.name, result)
        : self._finish();
    })
    .catch(function (err) {

      return self._handleResolveError(err);
    });
};


ResolveQueue.prototype._dequeue = function (resolve) {

  var allResolves = this._resolves;
  var resolveIndex = allResolves.indexOf(resolve);

  allResolves.splice(resolveIndex, 1);
};


ResolveQueue.prototype._runDependentsOf = function (name, value) {

  var self = this;

  return self
    ._resolves
    .filter(function (resolve) {

      return resolve.isDependentOn(name);
    })
    .forEach(function (dependent) {

      return dependent
        .setDependency(name, value)
        .isReady()
          ? self._run(dependent)
          : undefined;
    });
};


ResolveQueue.prototype.onResolve = function (callback) {

  return callback(); // ask observer if we should abort
};


ResolveQueue.prototype.onComplete = function (callback) {

  return callback(); // let observer know that we are done
};


ResolveQueue.prototype.onError = function (callback) {

  return callback(); // let observer know we had a booboo
};


ResolveQueue.prototype._handleResolveError = function (err) {

  throw err; // do something useful with err?
};
