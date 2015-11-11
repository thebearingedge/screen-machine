
'use strict';

import urlWatcher from './modules/urlWatcher';
import eventBus from './modules/eventBus';
import viewTree from './modules/viewTree';
import resolveFactory from './modules/resolveFactory';
import router from './modules/router';
import stateRegistry from './modules/stateRegistry';
import stateMachine from './modules/stateMachine';

export default function screenMachine(config) {

  const { document, promises, html5, eventsConfig: events } = config;
  const { defaultView: window } = document;
  const events = eventBus(eventsConfig); // jshint ignore: line
  const url = urlWatcher(window, { html5 });
  const routes = router();
  const registry = stateRegistry();
  const resolves = resolveFactory(promises);
  const machine = stateMachine(events, registry, promises);
  const Component = config.components(document, events, machine, routes);
  const views = viewTree(document, Component);

  return {

    state() {
      const registered = registry.add(...arguments);
      if (registered.path) routes.add(registered.name, registered.path);
      resolves.addTo(registered);
      views.processState(registered);
      return this;
    },

    start() {
      machine.init(registry.$root, {});
      views.mountRoot();
      url.subscribe(this._watchUrl.bind(this));
      window.addEventListener('click', this._catchLinks.bind(this));
      return this;
    },

    _watchUrl(url) {
      return this._navigateTo(url, { routeChange: true });
    },


    _navigateTo: function (url, options = {}) {
      const stateArgs = routes.find(url);
      if (stateArgs) {
        stateArgs.push(options);
        return this.transitionTo(...stateArgs);
      }
      events.notify('routeNotFound', url);
    },


    _catchLinks: function (evt) {
      const ignore = evt.altKey ||
                   evt.ctrlKey ||
                   evt.metaKey ||
                   evt.shiftKey ||
                   evt.defaultPrevented;
      if (ignore) return true;
      let anchor = null;
      let node = evt.target;
      while (node.parentNode) {
        if (node.nodeName === 'A') {
          anchor = node;
          break;
        }
        node = node.parentNode;
      }
      if (!anchor) return true;
      const href = anchor.getAttribute('href');
      if (href.match(/^([a-z]+:\/\/|\/\/)/)) return true;
      evt.preventDefault();
      return this._navigateTo(href);
    },


    transitionTo(stateOrName, params, query, options = {}) {
      return machine
        .transitionTo(...arguments)
        .then(transition => {
          if (!transition.isSuccessful()) return transition;
          transition._commit();
          const state = transition.toState;
          const components = state.getAllComponents();
          const resolved = machine.getResolved();
          views.compose(components, resolved, params, query);
          if (!options.routeChange) {
            url.push(routes.toUrl(state.name, params, query));
          }
          events.notify('stateChangeSuccess', transition);
          return transition._cleanup();
        });
    },

    go() {
      return this.transitionTo(...arguments);
    }

  };

}
