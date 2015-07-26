
'use strict';

var Transition = require('./Transition');


module.exports = stateMachine;


function stateMachine(events, resolveService) {

  var machine = {

    currentState: null,


    currentParams: null,


    transition: null,


    init: function init(startState, startParams) {

      this.currentState = startState;
      this.currentParams = startParams;

      return this;
    },


    transitionTo: function transitionTo(to, params) {

      var from = this.currentState;
      var fromParams = this.currentParams;
      var transition = new Transition(from, to, params, resolveService, this);

      events.notify('stateTransitionStart', to, params, from, fromParams);

      var self = this;

      return transition
        .attempt()
        .then(function (results) {

          if (transition.isSuperceded()) {

            return events.notify('stateTransitionSuperceded');
          }

          return self.changeState(results, to, params);
        })
        .catch(function (err) {

          if (err) {

            return events.notify('stateTransitionError', err);
          }

          return events.notify('stateTransitionSuperceded');
        });
    },


    changeState: function changeState(results, to, params) {

      var entering = results.entering;
      var exiting = results.exiting;

      results
        .tasks
        .forEach(function (task) {

          task.commit();
        });

      entering
        .slice()
        .reverse()
        .reduce(function (views, state) {

          return views.concat(state.getViews());
        }, [])
        .forEach(function (view) {

          view.load();
        });

      exiting
        .forEach(function (state) {

          state.sleep();
        });

      this.currentState = to;
      this.currentParams = params;

    }

  };

  return machine;
}
