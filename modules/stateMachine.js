
'use strict';

var Transition = require('./Transition');


module.exports = stateMachine;


function stateMachine(events, registry, resolves, router, views) {

  var Promise = resolves.Promise;

  var machine = {

    currentState: null,


    currentParams: null,


    transition: null,


    init: function init(startState, startParams) {

      this.currentState = startState;
      this.currentParams = startParams;


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
      var fromState = this.currentState;
      var fromParams = this.currentParams;
      var transition = this.transition = new Transition(
        this, fromState, fromParams, toState, toParams
      );

      events.notify('stateChangeStart', transition);

      if (transition.isSuperceded()) {

        events.notify('stateChangeAborted', transition);

        return Promise.resolve(transition);
      }

      var exitingStates = fromState
        .getBranch()
        .filter(function (state) {

          return !toState.contains(state);
        });

      var pivotState = exitingStates[0]
        ? exitingStates[0].$parent
        : null;

      var toBranch = toState.getBranch();

      var enteringStates = pivotState
        ? toBranch.slice(toBranch.indexOf(pivotState + 1))
        : toBranch.slice(1);

      var resolveTasks = toBranch
        .filter(function (state) {

          return state.isStale(fromParams, toParams);
        })
        .reduce(function (resolves, state) {

          return resolves.concat(state.getResolves());
        }, [])
        .map(function (resolve) {

          return resolves.createTask(resolve, toParams, resolveCache);
        });

      var resolveCache = resolves.getCache();

      return resolves
        .runTasks(resolveTasks, resolveCache, transition)
        .then(function () {

          if (transition.isSuperceded()) return;

          enteringStates
            .forEach(function (state) {

              state.onEnter();
            });

          exitingStates
            .forEach(function (state) {

              state.onExit();
            });

          views.compose(toState, toParams);

          this.currentState = toState;
          this.currentParams = toParams;
          this.transition = null;

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

  return machine;
}
