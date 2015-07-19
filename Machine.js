
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


    var runResolves = resolveService
      .createJob(resolveTasks, transition)
      .start();


    var sleepStates = fromState
      .getBranch()
      .filter(function (state) {

        return !toState.includes(state.name);
      });


    var activeViews = toState
      .getBranch()
      .reduce(function (views, state) {

        return views.concat(state.getViews());
      }, []);

  }

};
