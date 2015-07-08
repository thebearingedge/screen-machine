
'use strict';

module.exports = SimpleResolve;


function SimpleResolve(resolveKey, stateNode) {

  this.resolveKey = resolveKey;
  this.name = resolveKey + '@' + stateNode.name;
  this.stateNode = stateNode;

  this.invokable = stateNode.resolve[resolveKey];
}


SimpleResolve.prototype.execute = function (params) {

  return this.invokable.call(this.stateNode, params);
};
