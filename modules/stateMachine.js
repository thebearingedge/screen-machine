
'use strict';

var Transition = require('./Transition');


module.exports = stateMachine;


function stateMachine(events, registry, resolves, router, views) {

  var Promise = resolves.Promise;

  return {

    $state: {
      current: null,
      params: null,
      transition: null
    },


    init: function init(state, params) {

      this.$state.current = state;
      this.$state.params = params;
      this.$state.transition = null;

      return this;
    },


    state: function () {

      registry.add.apply(registry, arguments);

      return this;
    },


    start: function () {

      views.mountRoot();
      router.listen(function onRouteChange(name, params) {

        return this.transitionTo(name, params, { routeChange: true });
      }.bind(this));

      return this;
    },


    transitionTo: function (stateName, toParams, options) {

      options || (options = {});

      var toState = typeof stateName === 'string'
        ? registry.states[stateName]
        : stateName;
      var fromState = this.$state.current;
      var fromParams = this.$state.params;
      var resolveCache = resolves.getCache();
      var transition = new Transition(this, toState, toParams);

      this.$state.transition = transition;

      events.notify('stateChangeStart', transition);

      if (transition.isCanceled()) {

        events.notify('stateChangeCanceled', transition);

        return Promise.resolve(transition);
      }

      var tasks = toState
        .getBranch()
        .filter(function (state) {

          return state.isStale(fromParams, toParams) ||
            state.shouldResolve(resolveCache.$store);
        })
        .reduce(function (resolves, state) {

          return resolves.concat(state.getResolves());
        }, [])
        .map(function (resolve) {

          return resolves.createTask(resolve, toParams, resolveCache);
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

          transition.finish();

          var components = toState.getAllComponents();
          var resolved = resolveCache.$store;

          views.compose(components, resolved, toParams);

          if (!options.routeChange) {

            router.update(toState.name, toParams, { replace: false });
          }

          fromState
            .getBranch()
            .filter(function (state) {

              return !toState.contains(state);
            })
            .forEach(function (exiting) {

              exiting.sleep();
            });

          events.notify('stateChangeSuccess', transition);

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
