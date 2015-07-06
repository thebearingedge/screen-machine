
'use strict';

module.exports = ResolveQueue;


function ResolveQueue(resolves) {

  this._wait = resolves.length;
  this._resolves = resolves;
  this._completed = [];
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

  var resolvePromise = self._executeAsPromise(resolve);

  return resolvePromise
    .then(function (result) {

      resolve.result = result;
      self._completed.push(resolve);

      return --self._wait
        ? self._runDependentsOf(resolve)
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


ResolveQueue.prototype._runDependentsOf = function (resolve) {

  var self = this;

  return self
    ._resolves
    .filter(function (anyResolve) {

      return anyResolve.isDependentOn(resolve.name);
    })
    .forEach(function (dependent) {

      return dependent
        .setDependency(resolve.name, resolve.result)
        .isReady()
          ? self._run(dependent)
          : undefined;
    });
};


ResolveQueue.prototype._executeAsPromise = function (stateResolve) {

  return new ResolveQueue.Promise(function (resolve, reject) {

    var resultOrPromise;

    try {

      resultOrPromise = stateResolve.execute();
    }
    catch (err) {

      return reject(err);
    }

    return resolve(resultOrPromise);
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
