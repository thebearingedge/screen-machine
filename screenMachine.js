
'use strict';

var viewService = require('./modules/viewService');
var stateRegistry = require('./modules/stateRegistry');
var resolveService = require('./modules/resolveService');
var eventBus = require('./modules/eventBus');
var stateMachine = require('./modules/stateMachine');


module.exports = ScreenMachine;


function ScreenMachine(options) {

  if (!(this instanceof ScreenMachine)) {

    return new ScreenMachine(options);
  }

  var Promise = options.promises;
  var Component = options.components;
  var views = viewService(Component);
  var resolves = resolveService(Promise);
  var registry = stateRegistry(views, resolves);
  var events = eventBus(options.events);
  var machine = stateMachine(events, registry, resolves);

  machine.init(registry.$root, {});

  this.state = function () {

    registry.add.apply(registry, arguments);

    return this;
  };

  this.transitionTo = function (stateName, params) {

    var state = registry.states[stateName];

    return machine.transitionTo(state, params);
  };

  this.go = function () {

    return this.transitionTo.apply(this, arguments);
  };

}
