
'use strict';

module.exports = DependentResolve;


function DependentResolve(resolveKey, stateNode) {

  this.resolveKey = resolveKey;
  this.name = resolveKey + '@' + stateNode.name;
  this.stateNode = stateNode;

  var resolveDef = stateNode.resolve[resolveKey];
  var invokableIndex = resolveDef.length - 1;

  this.invokable = resolveDef[invokableIndex];
  this.dependencies = resolveDef
    .slice(0, invokableIndex)
    .map(function (dependency) {

      return dependency.indexOf('@') === -1
        ? dependency + '@' + stateNode.name
        : dependency;
    });
}


DependentResolve.prototype.execute = function (params, injectables) {

  var args = this
    .dependencies
    .map(function (dependency) {

      return injectables[dependency];
    })
    .concat(params);

  return this.invokable.apply(null, args);
};
