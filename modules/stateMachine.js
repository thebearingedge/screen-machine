
'use strict';

var Transition = require('./Transition');


module.exports = stateMachine;


function stateMachine(eventBus, registry, resolveService) {

  var Promise = resolveService.Promise;

  var machine = {

    currentState: null,


    currentParams: null,


    transition: null,


    init: function init(startState, startParams) {

      this.currentState = startState;
      this.currentParams = startParams;

      return this;
    },


    transitionTo: function transitionTo(stateName, toParams) {

      var toState = typeof stateName === 'string'
        ? registry.states[stateName]
        : stateName;
      var fromState = this.currentState;
      var fromParams = this.currentParams;
      var transition = this.transition = new Transition(
        this, fromState, fromParams, toState, toParams
      );

      eventBus.notify('stateChangeStart', transition);

      if (transition.isSuperceded()) {

        eventBus.notify('stateChangeAborted', transition);

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

          return resolveService.createTask(resolve, toParams, resolveCache);
        });

      var resolveCache = resolveService.getCache();

      return resolveService
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

          // viewTree.compose(toState, toParams);

          this.currentState = toState;
          this.currentParams = toParams;
          this.transition = null;

          eventBus.notify('stateChangeSuccess', transition);

        }.bind(this))
        .catch(function (err) {

          transition.setError(err);
          eventBus.notify('stateChangeError', transition);

          if (transition.isHandled()) {

            return Promise.resolve(transition);
          }

          throw err;
        });
    }

  };

  return machine;
}
