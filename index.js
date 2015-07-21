
'use strict';

var State = require('./modules/State');
var machine = require('./modules/machine');
var registry = require('./modules/stateRegistry');
var ResolveTask = require('./modules/ResolveTask');


module.exports = function screenMachine(config) {

  config || (config = {});
  ResolveTask.Promise = (config.promise || Promise);
  registry.init(new State({ name: '' }));

  return {

    start: function (state, params) {

      return machine.init(state, params);
    },


    state: function () {

      return registry.add(arguments);
    },


    transitionTo: function (stateName, params) {

      var state = registry.states[stateName];

      return machine.transitionTo(state, params);
    },


    go: function () {

      return this.transitionTo(arguments);
    }

  };


};