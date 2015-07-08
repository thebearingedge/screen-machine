
'use strict';

module.exports = ActiveResolve;


function ActiveResolve(stateResolve, params) {

  this.stateResolve = stateResolve;
  this.name = stateResolve.name;
  this.params = params;
  this.waitingFor = stateResolve.dependencies
    ? stateResolve.dependencies.slice()
    : [];
}


ActiveResolve.prototype.isDependentOn = function (dependency) {

  return this.waitingFor.indexOf(dependency) > -1;
};


ActiveResolve.prototype.setInjectable = function (dependency, value) {

  this.injectables || (this.injectables = {});

  this.injectables[dependency] = value;
  this.waitingFor.splice(this.waitingFor.indexOf(dependency), 1);

  return this;
};


ActiveResolve.prototype.isReady = function () {

  return !!!this.waitingFor.length;
};


ActiveResolve.prototype.execute = function () {

  var self = this;

  return new ActiveResolve.Promise(function (resolve, reject) {

    var resultOrPromise;

    try {

      resultOrPromise = self
        .stateResolve
        .execute(self.params, self.injectables);
    }
    catch (e) {

      return reject(e);
    }

    return resolve(resultOrPromise);
  });
};
