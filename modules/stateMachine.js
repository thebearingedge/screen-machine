
'use strict';

var Transition = require('./Transition');


module.exports = stateMachine;


function stateMachine(events, registry, resolves, router, views) {

  var Promise = resolves.Promise;

  return {

    currentState: null,


    currentParams: null,


    transition: null,


    init: function init(state, params) {

      this.currentState = state;
      this.currentParams = params;
      this.transition = null;

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
      var toBranch = toState.getBranch();
      var fromParams = this.currentParams;
      var transition = new Transition(this, toState, toParams);

      this.transition = transition;
      events.notify('stateChangeStart', transition);

      if (transition.isCanceled()) {

        events.notify('stateChangeCanceled', transition);

        return Promise.resolve(transition);
      }

      var resolveCache = resolves.getCache();
      var tasks = toBranch
        .filter(function (state) {

          return state.isStale(fromParams, toParams);
        })
        .reduce(function (resolves, state) {

          return resolves.concat(state.getResolves());
        }, [])
        .map(function (resolve) {

          return resolves.createTask(resolve, toParams, resolveCache);
        });

      return resolves
        .runTasks(tasks, resolveCache, transition)
        .then(function () {

          if (transition.isCanceled()) {

            events.notify('stateChangeCanceled', transition);

            return Promise.resolve(transition);
          }

          transition.finish();

          var components = toState.getAllComponents();

          views.compose(components, toParams);

          if (!options.routeChange) {

            router.update(toState.name, toParams, { replace: false });
          }

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
