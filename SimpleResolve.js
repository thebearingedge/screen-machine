
'use strict';

module.exports = SimpleResolve;


function SimpleResolve(resolveKey, stateNode, resolveCache) {

  this.key = resolveKey;
  this.name = resolveKey + '@' + stateNode.name;
  this.state = stateNode;
  this.cache = resolveCache;
  this.invokable = stateNode.resolve[resolveKey];
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
