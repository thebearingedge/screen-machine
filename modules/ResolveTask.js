
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


ResolveTask.prototype.execute = function execute() {

  var self = this;

  return new this.Promise(function (resolve, reject) {

    var resultOrPromise;

    try {

      resultOrPromise = self
        .resolve
        .execute(self.params, self.$dependencies);
    }
    catch (e) {

      return reject(e);
    }

    return resolve(resultOrPromise);
  });
};


ResolveTask.prototype.commit = function commit() {

  this.cache.set(this.id, this.result);

  return this;
};