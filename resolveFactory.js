
'use strict';

var SimpleResolve = require('./SimpleResolve');
var DependentResolve = require('./DependentResolve');


module.exports = {

  getCollection: function (params, stateNodes) {

    var self = this;

    return stateNodes.reduce(function (resolves, state) {

      self
        ._getStateResolves(params, state)
        .forEach(function (resolve) {

          resolves.push(resolve);
        });

      return resolves;
    }, []);
  },


  _hasDependencies: function (resolve) {

    return Array.isArray(resolve);
  },


  _getStateResolves: function (params, stateNode) {

    var stateNodeResolves = [];
    var stateParams = stateNode.filterParams(params);
    var resolveName, resolve;

    for (resolveName in stateNode.resolve) {

      resolve = this._getIntance(resolveName, stateParams, stateNode);
      stateNodeResolves.push(resolve);
    }

    return stateNodeResolves;
  },


  _getIntance: function (resolveName, stateParams, stateNode) {

    var resolve = stateNode.resolve[resolveName];

    return this._hasDependencies(resolve)
      ? new DependentResolve(resolveName, stateParams, stateNode)
      : new SimpleResolve(resolveName, stateParams, stateNode);
  }

};
