'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = stateMachine;

var _transition = require('./transition');

var _transition2 = _interopRequireDefault(_transition);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stateMachine(events, registry, Promise) {

  return {

    $state: { current: null, params: null, query: null },

    transition: null,

    init: function init(state, params, query) {
      var $state = { current: state, params: params, query: query };
      var transition = null;
      return Object.assign(this, { $state: $state, transition: transition });
    },
    getState: function getState(stateName) {
      return registry.states[stateName];
    },
    hasState: function hasState(stateOrName, params, query) {
      var current = this.$state.current;

      if (!current) return false;
      var state = this.getState(stateOrName);
      return state && current.contains(state) && this.hasParams(params, query);
    },
    isInState: function isInState(stateOrName, params, query) {
      var current = this.$state.current;

      return !!current && current === this.getState(stateOrName) && this.hasParams(params, query);
    },
    hasParams: function hasParams(params, query) {
      return equalForKeys(params || {}, this.$state.params) && equalForKeys(query || {}, this.$state.query);
    },
    createTransition: function createTransition(stateOrName, params, query) {
      var $state = this.$state;
      var cache = this.cache;

      var toState = typeof stateOrName === 'string' ? registry.states[stateOrName] : stateOrName;
      var fromState = $state.current;
      var fromParams = $state.params;
      var fromQuery = $state.query;
      var fromBranch = fromState.getBranch();
      var toBranch = toState.getBranch();
      var exiting = fromBranch.filter(exitingFrom(toState));
      var pivotState = exiting[0] ? exiting[0].getParent() : null;
      var toUpdate = dirtyFilter(fromParams, fromQuery, params, query, cache);
      var entering = undefined,
          updating = undefined;
      if (pivotState) {
        var pivotAfter = toBranch.indexOf(pivotState) + 1;
        entering = toBranch.slice(pivotAfter);
        updating = toBranch.slice(0, entering.length ? pivotAfter : toBranch.length).filter(toUpdate);
      } else {
        entering = toBranch.slice(toBranch.indexOf(fromState) + 1);
        updating = fromBranch.filter(toUpdate);
      }
      var transition = new _transition2.default(this, toState, params, query);
      var resolves = entering.concat(updating).reduce(collectResolves, []);
      this.transition = transition._prepare(resolves, cache, exiting, Promise);
      exiting.reverse().forEach(callHook('beforeExit', transition));
      updating.forEach(callHook('beforeUpdate', transition));
      entering.forEach(callHook('beforeEnter', transition));
      return transition;
    },
    transitionTo: function transitionTo() {
      var transition = this.createTransition.apply(this, arguments);
      events.notify('stateChangeStart', transition);
      if (transition.isCanceled()) return Promise.resolve(transition);
      return transition._attempt().catch(function (err) {
        if (!events.notify('stateChangeError', err)) throw err;
      });
    },

    cache: {

      $store: {},

      get: function get(id) {
        return this.$store[id];
      },
      set: function set(id, value) {
        this.$store[id] = value;
      },
      unset: function unset(id) {
        delete this.$store[id];
      },
      has: function has(id) {
        return id in this.$store;
      }
    },

    getResolved: function getResolved() {
      return Object.assign({}, this.cache.$store);
    }
  };
}

function dirtyFilter(fromParams, fromQuery, params, query, cache) {
  return function toUpdate(activeState) {
    return activeState.isStale(fromParams, fromQuery, params, query) || activeState.shouldResolve(cache);
  };
}

function exitingFrom(destination) {
  return function isExiting(activeState) {
    return !destination.contains(activeState);
  };
}

function collectResolves(resolves, state) {
  return resolves.concat(state.getResolves());
}

function callHook(hook, transition) {
  return function callTransitionHook(state) {
    typeof state[hook] === 'function' && state[hook].call(state, transition);
  };
}

function equalForKeys(partial, complete) {
  return Object.keys(partial).every(function (key) {
    return complete[key] === partial[key];
  });
}