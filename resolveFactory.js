
'use strict';

var SimpleResolve = require('./SimpleResolve');
var DependentResolve = require('./DependentResolve');
var ActiveResolve = require('./ActiveResolve');


module.exports = {

  instantiate: function (resolveKey, stateNode) {

    return Array.isArray(stateNode[resolveKey])
      ? new DependentResolve(resolveKey, stateNode)
      : new SimpleResolve(resolveKey, stateNode);
  },


  activate: function (stateResolve, params) {

    return new ActiveResolve(stateResolve, params);
  }

};
