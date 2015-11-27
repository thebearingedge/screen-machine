'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = screenMachine;

var _urlWatcher = require('./url-watcher');

var _urlWatcher2 = _interopRequireDefault(_urlWatcher);

var _eventBus = require('./event-bus');

var _eventBus2 = _interopRequireDefault(_eventBus);

var _viewTree = require('./view-tree');

var _viewTree2 = _interopRequireDefault(_viewTree);

var _resolveFactory = require('./resolve-factory');

var _resolveFactory2 = _interopRequireDefault(_resolveFactory);

var _routerFactory = require('./router-factory');

var _routerFactory2 = _interopRequireDefault(_routerFactory);

var _stateRegistry = require('./state-registry');

var _stateRegistry2 = _interopRequireDefault(_stateRegistry);

var _stateMachine = require('./state-machine');

var _stateMachine2 = _interopRequireDefault(_stateMachine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function screenMachine(config) {
  var document = config.document;
  var promises = config.promises;
  var _config$html = config.html5;
  var html5 = _config$html === undefined ? true : _config$html;
  var eventsConfig = config.events;
  var components = config.components;
  var window = document.defaultView;

  var events = (0, _eventBus2.default)(eventsConfig);
  var url = (0, _urlWatcher2.default)(window, { html5: html5 });
  var routes = (0, _routerFactory2.default)();
  var registry = (0, _stateRegistry2.default)();
  var resolves = (0, _resolveFactory2.default)(promises);
  var machine = (0, _stateMachine2.default)(events, registry, promises);
  var Component = components(document, events, machine, routes);
  var views = (0, _viewTree2.default)(document, Component);

  return {
    state: function state() {
      var registered = registry.add.apply(registry, arguments);
      if (registered.path) routes.add(registered.name, registered.path);
      resolves.addTo(registered);
      views.processState(registered);
      return this;
    },
    start: function start() {
      machine.init(registry.$root, {});
      views.mountRoot();
      url.subscribe(this._watchUrl.bind(this));
      window.addEventListener('click', this._catchLinks.bind(this));
      return this;
    },
    _watchUrl: function _watchUrl(url) {
      return this._navigateTo(url, { routeChange: true });
    },
    _navigateTo: function _navigateTo(url) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var stateArgs = routes.find(url);
      if (stateArgs) {
        stateArgs.push(options);
        return this.transitionTo.apply(this, _toConsumableArray(stateArgs));
      }
      events.notify('routeNotFound', url);
    },
    _catchLinks: function _catchLinks(evt) {
      var ignore = evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.defaultPrevented;
      if (ignore) return true;
      var anchor = null;
      var node = evt.target;
      while (node.parentNode) {
        if (node.nodeName === 'A') {
          anchor = node;
          break;
        }
        node = node.parentNode;
      }
      if (!anchor) return true;
      var href = anchor.getAttribute('href');
      if (href.match(/^([a-z]+:\/\/|\/\/)/)) return true;
      evt.preventDefault();
      return this._navigateTo(href);
    },
    transitionTo: function transitionTo(stateOrName, params, query) {
      var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      return machine.transitionTo.apply(machine, arguments).then(function (transition) {
        if (!transition.isSuccessful()) return transition;
        transition._commit();
        var state = transition.toState;
        var components = state.getAllComponents();
        var resolved = machine.getResolved();
        views.compose(components, resolved, params, query);
        if (!options.routeChange) {
          url.push(routes.toUrl(state.name, params, query));
        }
        events.notify('stateChangeSuccess', transition);
        return transition._cleanup();
      });
    },
    go: function go() {
      return this.transitionTo.apply(this, arguments);
    }
  };
}