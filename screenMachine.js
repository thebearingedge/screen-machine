
'use strict';

var State = require('./modules/State');
var stateMachine = require('./modules/stateMachine');
var registry = require('./modules/stateRegistry');
var ResolveTask = require('./modules/ResolveTask');


module.exports = function screenMachine(config) {



  config || (config = {});
  ResolveTask.Promise = (config.promise || Promise);
  registry.init(new State({ name: '' }));

  return {

    start: function (state, params) {

      return stateMachine.init(state, params);
    },


    state: function () {

      registry.add.apply(registry, arguments);

      return this;
    },


    transitionTo: function (stateName, params) {

      var state = registry.states[stateName];

      return stateMachine.transitionTo(state, params);
    },


    go: function () {

      return this.transitionTo.apply(this, arguments);
    }

  };


};