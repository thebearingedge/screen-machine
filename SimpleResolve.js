
'use strict';

module.exports = SimpleResolve;


function SimpleResolve(resolveKey, state, resolveCache) {

  this.key = resolveKey;
  this.name = resolveKey + '@' + state.name;
  this.state = state;
  this.cache = resolveCache;
  this.invokable = state.resolve[resolveKey];
}


SimpleResolve.prototype.execute = function (params) {

  return this.invokable.call(this.state, params);
};


SimpleResolve.prototype.getResult = function () {

  return this.cache.get(this.name);
};


SimpleResolve.prototype.clearResult = function () {

  this.cache.unset(this.name);

  return this;
};
