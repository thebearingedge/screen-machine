
'use strict';

import Transition from './Transition';

export default function stateMachine(events, registry, Promise) {

  return {

    $state: { current: null, params: null, query: null },

    transition: null,

    init(state, params, query) {
      Object.assign(this.$state, { current: state, params, query });
      this.transition = null;
      return this;
    },

    getState(stateName) {
      return registry.states[stateName];
    },

    hasState(stateOrName, params, query) {
      const { current } = this.$state;
      if (!current) return false;
      const state = this.getState(stateOrName);
      return state &&
             current.contains(state) &&
             this.hasParams(params, query);
    },

    isInState(stateOrName, params, query) {
      const { current } = this.$state;
      return !!current &&
             current === this.getState(stateOrName) &&
             this.hasParams(params, query);
    },

    hasParams(params, query) {
      return equalForKeys(params || {}, this.$state.params) &&
             equalForKeys(query || {}, this.$state.query);
    },

    createTransition(stateOrName, params, query) {
      const { $state, cache } = this;
      const toState = typeof stateOrName === 'string'
        ? registry.states[stateOrName]
        : stateOrName;
      const fromState = $state.current;
      const fromParams = $state.params;
      const fromQuery = $state.query;
      const fromBranch = fromState.getBranch();
      const toBranch = toState.getBranch();
      const exiting = fromBranch.filter(exitingFrom(toState));
      const pivotState = exiting[0]
        ? exiting[0].getParent()
        : null;
      const toUpdate = dirtyFilter(fromParams, fromQuery, params, query, cache);
      let entering, updating;
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
      const transition = new Transition(this, toState, params, query);
      const resolves = entering.concat(updating).reduce(collectResolves, []);
      this.transition = transition._prepare(resolves, cache, exiting, Promise);
      exiting.reverse().forEach(callHook('beforeExit', transition));
      updating.forEach(callHook('beforeUpdate', transition));
      entering.forEach(callHook('beforeEnter', transition));
      return transition;
    },

    transitionTo() {
      const transition = this.createTransition(...arguments);
      if (transition.isCanceled()) {
        return transition._fail('transition canceled');
      }
      else if (transition.isSuperseded()) {
        return transition._fail('transition superseded');
      }
      events.notify('stateChangeStart', transition);
      return transition
        ._attempt()
        .catch(err => {
          events.notify('stateChangeError', err);
          throw err;
        });
    },

    cache: {

      $store: {},

      get(resolveId) {
        return this.$store[resolveId];
      },

      set(resolveId, result) {
        this.$store[resolveId] = result;
      },

      unset(resolveId) {
        delete this.$store[resolveId];
      },

      has(resolveId) {
        return resolveId in this.$store;
      }

    },

    getResolved() {
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
    typeof state[hook] === 'function' && state[hook].call(state, transition);
  };
}

function equalForKeys(partial, complete) {
  var keys = Object.keys(partial);
  return !keys.length || keys.every(key => (complete[key] === partial[key]));
}
