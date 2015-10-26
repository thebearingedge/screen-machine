
'use strict';

var BaseResolve = require('./BaseResolve');

module.exports = SimpleResolve;


function SimpleResolve(resolveKey, state, Promise) {

  BaseResolve.call(this, resolveKey, state, Promise);

  this.invokable = state.resolve[resolveKey];
}


Object.assign(SimpleResolve.prototype, BaseResolve.prototype, {

  constructor: SimpleResolve,


  execute: function (params, query, transition) {

    return this.invokable.call(null, params, query, transition);
  }

});
