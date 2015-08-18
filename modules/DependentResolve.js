
'use strict';

module.exports = DependentResolve;


function DependentResolve(resolveKey, state, cache) {

  var resolveDef = state.resolve[resolveKey];
  var invokableIndex = resolveDef.length - 1;

  this.key = resolveKey;
  this.id = resolveKey + '@' + state.name;
  this.state = state;
  this.cache = cache;
  this.invokable = resolveDef[invokableIndex];
  this.injectables = resolveDef
    .slice(0, invokableIndex)
    .map(function (injectable) {

      return injectable.indexOf('@') > -1
        ? injectable
        : injectable + '@' + state.name;
    });
  this.cacheable = state.cacheable === false
    ? false
    : true;
}


DependentResolve.prototype.execute = function (params, query, dependencies) {

  var args = this
    .injectables
    .map(function (injectableId) {

      return dependencies[injectableId];
    })
    .concat(params, query);

  return this.invokable.apply(null, args);
};


DependentResolve.prototype.clearCache = function () {

  this.cache.unset(this.id);
};
