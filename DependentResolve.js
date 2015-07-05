
'use strict';

module.exports = DependentResolve;


function DependentResolve(resolveName, stateParams, stateNode) {

  this.name = resolveName;
  this.stateParams = stateParams;
  this.stateNode = stateNode;

  this._dependencies = {};

  var invokable = stateNode.resolve[resolveName];
  var funcIndex = invokable.length - 1;

  this._injectables = invokable.slice(0, funcIndex);
  this._invokable = invokable[funcIndex];
}


DependentResolve.prototype.isReady = function () {

  var self = this;

  return self._injectables.every(function (injectable) {

    return self._dependencies[injectable] !== undefined;
  });
};


DependentResolve.prototype.execute = function () {

  var self = this;

  var args = self
    ._injectables
    .map(function (injectable) {

      return self._dependencies[injectable];
    })
    .concat(self.stateParams);

  return self._invokable.apply(null, args);
};


DependentResolve.prototype.dependsOn = function (resolveName) {

  return this._injectables.indexOf(resolveName) !== -1;
};


DependentResolve.prototype.setDependency = function (name, value) {

  this._dependencies[name] = value;

  return this;
};
