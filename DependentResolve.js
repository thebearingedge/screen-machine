
'use strict';

module.exports = DependentResolve;


function DependentResolve(resolveKey, stateNode, resolveCache) {

  var resolveDef = stateNode.resolve[resolveKey];
  var invokableIndex = resolveDef.length - 1;

  this.key = resolveKey;
  this.name = resolveKey + '@' + stateNode.name;
  this.node = stateNode;
  this.cache = resolveCache;
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

  return this.invokable.apply(this.node, args);
};


DependentResolve.prototype.getCache = function () {

  return this.cache.get(this.name);
};


DependentResolve.prototype.clearCache = function () {

  this.cache.unset(this.name);

  return this;
};
