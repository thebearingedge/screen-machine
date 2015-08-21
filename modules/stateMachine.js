
'use strict';

var Transition = require('./Transition');


module.exports = stateMachine;


function stateMachine(events, registry, resolves, views) {

  var Promise = resolves.Promise;

  return {

    $state: {
      current: null,
      params: null,
      query: null,
      transition: null
    },


    init: function init(state, params, query) {

      this.$state.current = state;
      this.$state.params = params;
      this.$state.query = query;
      this.$state.transition = null;

      return this;
    },


    transitionTo: function (stateOrName, toParams, toQuery, options) {

      options || (options = {});

      var toState = typeof stateOrName === 'string'
        ? registry.states[stateOrName]
        : stateOrName;
      var fromState = this.$state.current;
      var fromParams = this.$state.params;
      var fromQuery = this.$state.query;
      var resolveCache = resolves.getCache();
      var transition = new Transition(this, toState, toParams, toQuery);

      this.$state.transition = transition;

      events.notify('stateChangeStart', transition);

      if (transition.isCanceled()) {

        events.notify('stateChangeCanceled', transition);

        return Promise.resolve(transition);
      }

      var tasks = toState
        .getBranch()
        .filter(function (state) {

          return state.isStale(fromParams, toParams, fromQuery, toQuery) ||
                 state.shouldResolve(resolveCache.$store);
        })
        .reduce(function (resolves, state) {

          return resolves.concat(state.getResolves());
        }, [])
        .map(function (resolve) {

          return resolves.createTask(resolve, toParams, toQuery, resolveCache);
        });

      return resolves
        .runTasks(tasks, resolveCache, transition)
        .then(function (completed) {

          if (transition.isCanceled()) {

            events.notify('stateChangeCanceled', transition);

            return Promise.resolve(transition);
          }

          completed
            .forEach(function (task) {

              task.commit();
            });

          transition.resolved = resolveCache.$store;
          transition.finish();
          events.notify('stateChangeSuccess', transition);

          return Promise.resolve(transition);

        }.bind(this))
        .catch(function (err) {

          transition.setError(err);
          events.notify('stateChangeError', transition);

          if (transition.isHandled()) {

            return Promise.resolve(transition);
          }

          throw err;
        });
    }

  };
}
