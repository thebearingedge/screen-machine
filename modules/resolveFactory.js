
'use strict';

var SimpleResolve = require('./baseSimpleResolve');
var DependentResolve = require('./baseDependentResolve');

module.exports = resolveFactory;


function resolveFactory(Promise) {

  return {

    instantiate: function (resolveKey, state) {

      return Array.isArray(state.resolve[resolveKey])
        ? new DependentResolve(resolveKey, state, Promise)
        : new SimpleResolve(resolveKey, state, Promise);
    },


    addTo: function (state) {

      if (typeof state.resolve !== 'object') return;

      Object
        .keys(state.resolve)
        .forEach(function (resolveKey) {

          state.addResolve(this.instantiate(resolveKey, state));
        }, this);
    }

  };
}
