
'use strict';

var router = require('./modules/router');
var stateRegistry = require('./modules/stateRegistry');
var resolveService = require('./modules/resolveService');
var viewTree = require('./modules/viewTree');
var View = require('./modules/View');
var eventBus = require('./modules/eventBus');
var stateMachine = require('./modules/stateMachine');


module.exports = ScreenMachine;


function ScreenMachine(config) {

  if (!(this instanceof ScreenMachine)) {

    return new ScreenMachine(config);
  }

  var document = config.document;
  var Promise = config.promises;
  var Component = config.components(document);
  var routing = config.routing;
  var events = eventBus(config.events);

  var views = viewTree(View, Component);
  var resolves = resolveService(Promise);
  var routes = router(document.defaultView, routing);
  var registry = stateRegistry(views, resolves, routes);
  var machine = stateMachine(events);


  machine.init(registry.$root, {});


  this.state = function () {

    registry.add.apply(registry, arguments);

    return this;
  };


  this.transitionTo = function (stateName, params) {

    var state = registry.states[stateName];

    return machine.transitionTo(state, params);
  };


  this.start = function () {

    routes.start(this.transitionTo);
  };


  this.go = function () {

    return this.transitionTo.apply(this, arguments);
  };

}
