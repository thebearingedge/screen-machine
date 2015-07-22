
'use strict';

var resolveService = require('./resolveService');
var Transition = require('./Transition');


module.exports = {

  currentState: null,


  currentParams: null,


  transition: null,


  init: function (state, params) {

    this.currentState = state;
    this.currentParams = params;
  },


  transitionTo: function (toState, toParams) {

    var transition = this.transition = new Transition(this);
    var fromState = this.currentState;

    var exitingStates = fromState
      .getBranch()
      .filter(function (state) {

        return !toState.includes(state.name);
      });

    var pivotState = exitingStates[0].getParent();

    var toBranch = toState.getBranch();

    var enteringStates = toBranch
      .slice(toBranch.indexOf(pivotState) + 1);

    var resolveTasks = enteringStates
      .filter(function (state) {

        return state.isStale(toParams);
      })
      .reduce(function (resolves, state) {

        return resolves.concat(state.getResolves());
      }, [])
      .map(function (resolve) {

        return resolveService.createTask(resolve, toParams);
      });

    var resolveJob = resolveService.createJob(resolveTasks, transition);

    var self = this;

    return resolveJob
      .start(function (err, completed) {

        if (err) {

          throw err; // BAH!
        }

        if (completed) {

          return self
            .commitResolves(completed)
            .commitTransition(toState, toParams)
            .loadViews(enteringStates)
            .publishViews(toBranch)
            .finish(exitingStates);
        }

        // do something when superceded
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


  publishViews: function (toBranch) {

    toBranch
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


  cleanUp: function (exitingStates) {

    exitingStates
      .forEach(function (state) {

        state.sleep();
      });

    return this;
  }

};
