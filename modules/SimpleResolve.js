
'use strict';

module.exports = SimpleResolve;


function SimpleResolve(resolveKey, state) {

  this.key = resolveKey;
  this.id = resolveKey + '@' + state.name;
  this.state = state;
  this.invokable = state.resolve[resolveKey];
  this.cacheable = state.cacheable === false
    ? false
    : true;
}


SimpleResolve.prototype.execute = function (params) {

  return this.invokable.call(null, params);
};
