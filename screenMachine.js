
'use strict';

var urlWatcher = require('./modules/urlWatcher');
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
  var url = urlWatcher(window, { html5: config.html5 });
  var routes = router();
  var Component = config.components(document, routes);
  var views = viewTree(document, Component);
  var resolves = resolveService(Promise);
  var registry = stateRegistry(views, resolves, routes);
  var events = eventBus(config.events);
  var machine = stateMachine(events, registry, resolves, views);

  return {

    state: function state() {

      var registered = registry.add.apply(registry, arguments);

      if (typeof registered.path !== undefined) {

        routes.add(registered.name, registered.path);
      }

      return this;
    },

    start: function start() {

      machine.init(registry.$root, {});
      views.mountRoot();
      url.subscribe(this.fromUrl.bind(this));

      return this;
    },

    fromUrl: function fromUrl(url) {

      var args = routes.find(url);

      if (!args) {

        events.notify('routeNotFound', url);
      }
      if (args) {

        args.push({ routeChange: true });

        return this.transitionTo.apply(this, args);
      }
    },

    transitionTo: function transitionTo(stateOrName, params, query, options) {

      options || (options = {});

      return machine.transitionTo.apply(machine, arguments)
        .then(function (transition) {

          if (transition.isCanceled()) return;

          var state = transition.toState;
          var components = state.getAllComponents();
          var resolved = transition.resolved;

          views.compose(components, resolved, params, query);

          if (!options.routeChange) {

            url.push(routes.href(state.name, params, query));
          }

          transition.cleanup();
        });
    },

    go: function go() {

      return this.transitionTo.apply(null, arguments);
    }
  };
}

