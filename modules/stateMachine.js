
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


    hasState: function (stateName, params, query) {

      if (!this.$state.current) return false;

      var state = registry.states[stateName];
      var hasState = this.$state.current.contains(state);
      var hasParams = equalForKeys(params || {}, this.$state.params);
      var hasQuery = equalForKeys(query || {}, this.$state.query);

      return hasState && hasParams && hasQuery;
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
      var toUpdate = shouldUpdate(fromParams, fromQuery, params, query, cache);
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

      transition.prepare(resolves, cache, exiting, Promise);
      this.transition = transition;

      exiting.reverse().forEach(callHook('beforeExit', transition));
      updating.forEach(callHook('beforeUpdate', transition));
      entering.forEach(callHook('beforeEnter', transition));

      return transition;
    },


    transitionTo: function () {

      var deferred = new Deferred();
      var transition = this.createTransition.apply(this, arguments);

      if (transition.isCanceled()) {

        events.notify('stateChangeCanceled', transition);
        deferred.resolve(transition);
        return deferred.promise;
      }
      else {

        events.notify('stateChangeStart', transition);
      }

      transition
        .attempt()
        .then(function () {

          if (transition.isCanceled()) {

            events.notify('stateChangeCanceled', transition);
            return deferred.resolve(transition);
          }

          transition._finish();
          return deferred.resolve(transition);
        })
        .catch(function (err) {

          transition.setError(err);
          events.notify('stateChangeError', transition);

          if (transition.isHandled()) {

            return deferred.resolve(transition);
          }

          return deferred.reject(err);
        });

      return deferred.promise;
    },

    cache: {

      $store: {},

      get: function get(resolveId) {

        return this.$store[resolveId];
      },

      set: function set(resolveId, result) {

        this.$store[resolveId] = result;
      },

      unset: function unset(resolveId) {

        delete this.$store[resolveId];
      }
    }

  };
}


function Deferred() {

  this.promise = new Promise(function (resolve, reject) {

    this._resolve = resolve;
    this._reject = reject;
  }.bind(this));

  this.resolve = function (result) { this._resolve(result); };
  this.reject = function (reason) { this._reject(reason); };
}

function shouldUpdate(fromParams, fromQuery, params, query, cache) {

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
