
'use strict';

var resolveCache = require('./resolveCache');
var SimpleResolve = require('./SimpleResolve');
var DependentResolve = require('./DependentResolve');
var ActiveResolve = require('./ActiveResolve');


module.exports = {

  instantiate: function (resolveKey, stateNode) {

    return Array.isArray(stateNode[resolveKey])
      ? new DependentResolve(resolveKey, stateNode, resolveCache)
      : new SimpleResolve(resolveKey, stateNode, resolveCache);
  },


  activate: function (stateResolve, params) {

    return new ActiveResolve(stateResolve, params);
  }

};
