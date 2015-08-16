
'use strict';

module.exports = DependentResolve;


function DependentResolve(resolveKey, state) {

  var resolveDef = state.resolve[resolveKey];
  var invokableIndex = resolveDef.length - 1;

  this.key = resolveKey;
  this.id = resolveKey + '@' + state.name;
  this.state = state;
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


DependentResolve.prototype.execute = function (params, dependencies) {

  var args = this
    .injectables
    .map(function (injectableId) {

      return dependencies[injectableId];
    })
    .concat(params);

  return this.invokable.apply(null, args);
};
