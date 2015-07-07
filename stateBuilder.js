
'use strict';

var StateNode = require('./StateNode');
var resolveFactory = require('./resolveFactory');

module.exports = {

  build: function (name, stateDef) {

    if (arguments.length === 2) stateDef.name = name;
    else stateDef = name;

    var stateNode = new StateNode(stateDef);

    return this.attachResolves(stateNode);
  },


  attachResolves: function (stateNode) {

    var resolves = stateNode.resolve;
    var resolveKey, resolve;

    for (resolveKey in resolves) {

      resolve = resolveFactory.instantiate(resolves[resolveKey], stateNode);

      stateNode.setResolve(resolve);
    }

    return stateNode;
  }

};