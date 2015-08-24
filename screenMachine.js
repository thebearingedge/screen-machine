
'use strict';

var assign = require('object-assign');
var urlWatcher = require('./modules/urlWatcher');
var eventBus = require('./modules/eventBus');
var viewTree = require('./modules/viewTree');
var resolveFactory = require('./modules/resolveFactory');
var router = require('./modules/router');
var stateRegistry = require('./modules/stateRegistry');
var stateMachine = require('./modules/stateMachine');

module.exports = screenMachine;


function screenMachine(config) {

  var document = config.document;
  var window = document.defaultView;
  var Promise = config.promises;
  var html5 = config.html5;

  var events = eventBus(config.events);
  var url = urlWatcher(window, { html5: html5 });
  var routes = router({ html5: html5  });
  var registry = stateRegistry();
  var resolves = resolveFactory(Promise);
  var machine = stateMachine(events, registry, Promise);
  var Component = config.components(document, events, machine, routes);
  var views = viewTree(document, Component);

  return {

    state: function state() {

      var registered = registry.add.apply(registry, arguments);

      if (registered.path) {

        routes.add(registered.name, registered.path);
      }

      if (registered.resolve) {

        resolves.addTo(registered);
      }

      views.processState(registered);

      return this;
    },


    start: function start() {

      machine.init(registry.$root, {});
      views.mountRoot();
      url.subscribe(this._watchUrl.bind(this));

      return this;
    },


    _watchUrl: function _watchUrl(url) {

      var args = routes.find(url);

      if (!args) {

        events.notify('routeNotFound');
      }
      else {

        events.notify('routeChange');

        args.push({ routeChange: true });

        return this.transitionTo.apply(this, args);
      }
    },


    transitionTo: function transitionTo(stateOrName, params, query, options) {

      options || (options = {});

      return machine.transitionTo.apply(machine, arguments)
        .then(function (transition) {

          if (transition.isCanceled()) {

            return transition;
          }

          var state = transition.toState;
          var components = state.getAllComponents();
          var resolved = assign({}, machine.cache.$store);

          views.compose(components, resolved, params, query);

          if (!options.routeChange) {

            url.push(routes.toUrl(state.name, params, query));
            events.notify('routeChange');
          }

          events.notify('stateChangeSuccess', transition);
          return transition._cleanup();
        });
    },


    go: function go() {

      return this.transitionTo.apply(null, arguments);
    }
  };
}

