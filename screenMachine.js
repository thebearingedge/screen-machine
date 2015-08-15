
'use strict';

var eventBus = require('./modules/eventBus');
var viewTree = require('./modules/viewTree');
var resolveService = require('./modules/resolveService');
var router = require('./modules/router');
var stateRegistry = require('./modules/stateRegistry');
var stateMachine = require('./modules/stateMachine');


module.exports = screenMachine;


function screenMachine(config) {

  var document = config.document;
  var window = document.defaultView;
  var Promise = config.promises;
  var Component = config.components(document);
  var views = viewTree(document, Component);
  var resolves = resolveService(Promise);
  var routes = router(window, { html5: config.html5 });
  var states = stateRegistry(views, resolves, routes);
  var events = eventBus(config.events);

  var machine = stateMachine(events, states, resolves, routes, views);

  return machine.init(states.$root, {});
}

