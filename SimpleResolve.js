
'use strict';

module.exports = SimpleResolve;


function SimpleResolve(resolveKey, stateNode, resolveCache) {

  this.key = resolveKey;
  this.name = resolveKey + '@' + stateNode.name;
  this.node = stateNode;
  this.cache = resolveCache;
  this.invokable = stateNode.resolve[resolveKey];
}


SimpleResolve.prototype.execute = function (params) {

  return this.invokable.call(this.node, params);
};


SimpleResolve.prototype.getValue = function () {

  return this.cache.get(this.name);
};


SimpleResolve.prototype.clearCache = function () {

  this.cache.unset(this.name);

  return this;
};
