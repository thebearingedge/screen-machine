
'use strict';

module.exports = stateMachine;


function stateMachine(resolveService, Transition) {

  return {

    currentState: null,


    currentParams: null,


    transition: null,


    init: function (state, params) {

      this.currentState = state;
      this.currentParams = params;
    },


    transitionTo: function (toState, toParams) {

      var exitingStates = this.getExitingStates(this.currentState, toState);
      var pivotState = exitingStates[0].getParent();
      var newBranch = toState.getBranch();
      var enteringStates = newBranch.slice(newBranch.indexOf(pivotState) + 1);
      var transition = this.transition = new Transition(this);
      var resolveTasks = this.getResolveTasks(newBranch, toParams);
      var resolveJob = resolveService.createJob(resolveTasks, transition);

      return resolveJob
        .start(function (err, completed) {

          if (err) {

            throw err; // BAH!
          }

          if (completed) {

            return this
              .commitResolves(completed)
              .commitTransition(toState, toParams)
              .loadViews(enteringStates)
              .publishViews(newBranch)
              .finish(exitingStates);
          }

          // do something when superceded
        }.bind(this));
    },


    getExitingStates: function (fromState, toState) {

      return fromState
        .getBranch()
        .filter(function (state) {

          return !toState.contains(state.name);
        });
    },


    getResolveTasks: function (newBranch, toParams) {

      return newBranch
        .filter(function (state) {

          return state.isStale(toParams);
        })
        .reduce(function (resolves, state) {

          return resolves.concat(state.getResolves());
        }, [])
        .map(function (resolve) {

          return resolveService.createTask(resolve, toParams);
        });
    },


    commitResolves: function (completed) {

      completed
        .forEach(function (task) {

          task.commit();
        });

      return this;
    },


    commitTransition: function (toState, toParams) {

      this.currentState = toState;
      this.params = toParams;
      this.transition = null;

      return this;
    },


    loadViews: function (enteringStates) {

      enteringStates
        .slice()
        .reverse()
        .reduce(function (views, state) {

          return views.concat(state.getViews());
        }, [])
        .forEach(function (view) {

          view.load();
        });

      return this;
    },


    publishViews: function (newBranch) {

      newBranch
        .reduce(function (viewLoaders, state) {

          return viewLoaders.concat(state.getViewLoaders());
        }, [])
        .filter(function (viewLoader) {

          return viewLoader.isLoaded() || viewLoader.shouldRefresh();
        })
        .forEach(function (viewLoader) {

          viewLoader.publish();
        });

      return this;
    },


    finish: function (exitingStates) {

      exitingStates
        .forEach(function (state) {

          state.sleep();
        });

      return this;
    }

  };

}
