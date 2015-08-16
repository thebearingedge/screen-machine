
'use strict';

module.exports = SimpleResolve;


function SimpleResolve(resolveKey, state, cache) {

  this.key = resolveKey;
  this.id = resolveKey + '@' + state.name;
  this.state = state;
  this.cache = cache;
  this.invokable = state.resolve[resolveKey];
  this.cacheable = state.cacheable === false
    ? false
    : true;
}


SimpleResolve.prototype.execute = function (params) {

  return this.invokable.call(null, params);
};


SimpleResolve.prototype.clearCache = function () {

  this.cache.unset(this.id);
};
