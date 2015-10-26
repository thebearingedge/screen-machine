
'use strict';

var BaseResolve = require('./BaseResolve');

module.exports = DependentResolve;


function DependentResolve(resolveKey, state, Promise) {

  BaseResolve.call(this, resolveKey, state, Promise);

  var resolveDef = state.resolve[resolveKey];
  var invokableIndex = resolveDef.length - 1;

  this.invokable = resolveDef[invokableIndex];
  this.injectables = resolveDef
    .slice(0, invokableIndex)
    .map(function (injectable) {

      return injectable.indexOf('@') > -1
        ? injectable
        : injectable + '@' + state.name;
    });

}


Object.assign(DependentResolve.prototype, BaseResolve.prototype, {

  constructor: DependentResolve,


  execute: function execute(params, query, transition, dependencies) {

    var args = this
      .injectables
      .map(function (injectable) {

        return dependencies[injectable];
      })
      .concat(params, query, transition);

    return this.invokable.apply(null, args);
  }

});
