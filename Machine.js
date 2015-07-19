
'use strict';

var resolveService = require('./resolveService');
var Transition = require('./Transition');


module.exports = {

  currentState: null,


  currentParams: null,


  transition: null,


  init: function (state, params) {

    this.state.current = state;
    this.state.params = params;
  },


  transitionTo: function (toState, toParams) {

    var transition = this.transition = new Transition(this);
    var fromState = this.currentState;
    var fromParams = this.currentParams;


    var sleepStates = fromState
      .getBranch()
      .filter(function (state) {

        return !toState.includes(state.name);
      });


    var resolveTasks = toState
      .getBranch()
      .filter(function (state) {

        return state.isStale(fromParams, toParams);
      })
      .reduce(function (resolves, state) {

        return resolves.concat(state.getResolves());
      }, [])
      .map(function (resolve) {

        var params = resolve.state.filterParams(toParams);

        return resolveService.createTask(resolve, params);
      });


    var resolveJob = resolveService
      .createJob(resolveTasks, transition);


    var self = this;

    return resolveJob
      .start()
      .then(function (completed) {

        return self
          .commitResolves(completed)
          .loadViews(toState)
          .publishViews(toState)
          .shutDownStates(sleepStates);
      })
      .catch(function (err) {

        throw err; // BAH!
      });
  },


  commitResolves: function (completed) {

    completed
      .forEach(function (task) {

        task.commit();
      });
  },


  publishViews: function (toState) {

    toState
      .getBranch()
      .reduce(function (viewLoaders, state) {

        return viewLoaders.concat(state.getViewLoaders());
      }, [])
      .filter(function (viewLoader) {

        return viewLoader.isLoaded() || viewLoader.shouldRefresh();
      })
      .forEach(function (viewLoader) {

        viewLoader.publish();
      });
  },


  loadViews: function (toState) {

    toState
      .getBranch()
      .reverse()
      .reduce(function (views, state) {

        return views.concat(state.getViews());
      }, [])
      .forEach(function (view) {

        view.load();
      });

    return this;
  },


  shutDownStates: function (sleepStates) {

    sleepStates
      .forEach(function (state) {

        state.sleep();
      });

    return this;
  }

};
