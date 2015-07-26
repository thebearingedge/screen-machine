
'use strict';

var eventBus = require('./modules/eventBus');
var stateMachine = require('./modules/stateMachine');
var stateRegistry = require('./modules/stateRegistry');
var resolveService = require('./modules/resolveService');
var viewBuilder = require('./modules/viewBuilder');


module.exports = screenMachine;


function screenMachine(config) {

  var Promise = config.promises || Promise;
  var Component = config.components;
  var views = viewBuilder(Component);
  var resolves = resolveService(Promise);
  var registry = stateRegistry(views, resolves);
  var events = eventBus(config.events);
  var machine = stateMachine(events, resolves);

  return {

    state: function () {

      registry.add.apply(registry, arguments);

      return this;
    },


    transitionTo: function (stateName, params) {

      var state = registry.states[stateName];

      return machine.transitionTo(state, params);
    },


    go: function () {

      return this.transitionTo.apply(this, arguments);
    }

  };
}
