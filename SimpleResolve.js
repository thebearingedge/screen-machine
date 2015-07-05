
'use strict';

module.exports = SimpleResolve;


function SimpleResolve(resolveName, stateParams, stateNode) {

  this.name = resolveName;
  this.stateParams = stateParams;
  this.stateNode = stateNode;

  this._invokable = stateNode.resolve[resolveName];
}


SimpleResolve.prototype.isReady = function () {

  return true;
};


SimpleResolve.prototype.execute = function () {

  return this._invokable.call(null, this.stateParams);
};
