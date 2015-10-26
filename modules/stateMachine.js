
'use strict';

var Transition = require('./Transition');

module.exports = stateMachine;


function stateMachine(events, registry, Promise) {

  return {

    $state: {
      current: null,
      params: null,
      query: null
    },


    transition: null,


    init: function (state, params, query) {

      this.$state.current = state;
      this.$state.params = params;
      this.$state.query = query;
      this.transition = null;
      return this;
    },


    getState: function (stateOrName) {

      return typeof stateOrName === 'string'
        ? registry.states[stateOrName]
        : stateOrName;
    },


    hasState: function (stateOrName, params, query) {

      if (!this.$state.current) return false;

      var state = this.getState(stateOrName);

      return state &&
             this.$state.current.contains(state) &&
             this.hasParams(params, query);
    },


    isInState: function (stateOrName, params, query) {

      if (!this.$state.current) return false;

      var state = this.getState(stateOrName);

      return this.$state.current === state &&
             this.hasParams(params, query);
    },


    hasParams: function (params, query) {

      return equalForKeys(params || {}, this.$state.params) &&
             equalForKeys(query || {}, this.$state.query);
    },


    createTransition: function (stateOrName, params, query, options) {

      options || (options = {});

      var toState = typeof stateOrName === 'string'
        ? registry.states[stateOrName]
        : stateOrName;
      var fromState = this.$state.current;
      var fromParams = this.$state.params;
      var fromQuery = this.$state.query;
      var cache = this.cache;
      var fromBranch = fromState.getBranch();
      var toBranch = toState.getBranch();
      var exiting = fromBranch.filter(exitingFrom(toState));
      var pivotState = exiting[0]
        ? exiting[0].getParent()
        : null;
      var toUpdate = dirtyFilter(fromParams, fromQuery, params, query, cache);
      var entering, updating;

      if (pivotState) {

        entering = toBranch.slice(toBranch.indexOf(pivotState) + 1);
        updating = toBranch
          .slice(0, entering.indexOf(pivotState) + 1)
          .filter(toUpdate);
      }
      else {

        entering = toBranch.slice(toBranch.indexOf(fromState) + 1);
        updating = fromBranch.filter(toUpdate);
      }

      var transition = new Transition(this, toState, params, query, options);
      var resolves = entering
        .concat(updating)
        .reduce(collectResolves, []);

      this.transition = transition;
      transition._prepare(resolves, cache, exiting, Promise);

      exiting.reverse().forEach(callHook('beforeExit', transition));
      updating.forEach(callHook('beforeUpdate', transition));
      entering.forEach(callHook('beforeEnter', transition));
      return transition;
    },


    transitionTo: function () {

      var transition = this.createTransition.apply(this, arguments);

      if (transition.isCanceled()) {

        return transition._fail('transition canceled');
      }
      else if (transition.isSuperseded()) {

        return transition._fail('transition superseded');
      }

      events.notify('stateChangeStart', transition);

      return transition
        ._attempt()
        .catch(function (err) {

          events.notify('stateChangeError', err);
          throw err;
        });
    },

    cache: {

      $store: {},

      get: function (resolveId) {

        return this.$store[resolveId];
      },

      set: function (resolveId, result) {

        this.$store[resolveId] = result;
      },

      unset: function (resolveId) {

        delete this.$store[resolveId];
      }

    },

    getResolved: function () {

      return Object.assign({}, this.cache.$store);
    }

  };
}


function dirtyFilter(fromParams, fromQuery, params, query, cache) {

  return function toUpdate(activeState) {

    return activeState.isStale(fromParams, fromQuery, params, query) ||
           activeState.shouldResolve(cache);
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

    if (typeof state[hook] === 'function') {

      state[hook].call(state, transition);
    }
  };
}

function equalForKeys(partial, complete) {

  var keys = Object.keys(partial);

  if (!keys.length) return true;

  return keys.every(function (key) {

    return complete[key] === partial[key];
  });
}
