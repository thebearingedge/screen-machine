
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
  this.injectables = resolveDef
    .slice(0, invokableIndex)
    .map(function (injectable) {

      return injectable.indexOf('@') > -1
        ? injectable
        : injectable + '@' + stateNode.name;
    });
}


DependentResolve.prototype.execute = function (params, dependencies) {

  var args = this
    .injectables
    .map(function (injectable) {

      return dependencies[injectable];
    })
    .concat(params);

  return this.invokable.apply(this.node, args);
};


DependentResolve.prototype.getValue = function () {

  return this.cache.get(this.name);
};


DependentResolve.prototype.clearCache = function () {

  this.cache.unset(this.name);

  return this;
};
