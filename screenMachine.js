
'use strict';

var eventBus = require('./modules/eventBus');
var stateMachine = require('./modules/stateMachine');
var stateRegistry = require('./modules/stateRegistry');
var resolveService = require('./modules/resolveService');
var viewBuilder = require('./modules/viewBuilder');


module.exports = ScreenMachine;


function ScreenMachine(options) {

  if (!(this instanceof ScreenMachine)) {

    return new ScreenMachine(options);
  }

  var Promise = options.promises || Promise;
  var Component = options.components;
  var views = viewBuilder(Component);
  var resolves = resolveService(Promise);
  var registry = stateRegistry(views, resolves);
  var events = eventBus(options.events);
  var machine = stateMachine(events, resolves);

  machine.init(registry.$root, {});

  this.state = function state() {

    registry.add.apply(registry, arguments);

    return this;
  };

  this.transitionTo = function transitionTo(stateName, params) {

    var state = registry.states[stateName];

    return machine.transitionTo(state, params);
  };

  this.go = function go() {

    return this.transitionTo.apply(this, arguments);
  };

}
