
'use strict';

module.exports = ResolveTask;


function ResolveTask(resolve, params, resolveCache) {

  this.delegate = resolve;
  this.name = resolve.name;
  this.params = params;
  this.cache = resolveCache;
  this.waitingFor = resolve.dependencies
    ? resolve.dependencies.slice()
    : [];
}


ResolveTask.prototype.isDependentOn = function (dependency) {

  return this.waitingFor.indexOf(dependency) > -1;
};


ResolveTask.prototype.setInjectable = function (dependency, value) {

  this.injectables || (this.injectables = {});
  this.injectables[dependency] = value;
  this.waitingFor.splice(this.waitingFor.indexOf(dependency), 1);

  return this;
};


ResolveTask.prototype.isReady = function () {

  return !!!this.waitingFor.length;
};


ResolveTask.prototype.execute = function () {

  var self = this;

  return new ResolveTask.Promise(function (resolve, reject) {

    var resultOrPromise;

    try {

      resultOrPromise = self
        .delegate
        .execute(self.params, self.injectables);
    }
    catch (e) {

      return reject(e);
    }

    return resolve(resultOrPromise);
  });
};


ResolveTask.prototype.commit = function () {

  this.cache.set(this.name, this.result);

  return this;
};
