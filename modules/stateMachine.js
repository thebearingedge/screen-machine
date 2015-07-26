
'use strict';

var Transition = require('./Transition');


module.exports = stateMachine;


function stateMachine(eventBus, resolveService) {

  var machine = {

    currentState: null,


    currentParams: null,


    transition: null,


    init: function (startState, startParams) {

      this.currentState = startState;
      this.currentParams = startParams;

      return this;
    },


    transitionTo: function (to, params) {

      var from = this.currentState;
      var fromParams = this.currentParams;

      this.transition = new Transition(from, to, params, resolveService, this);
      eventBus.notify('stateTransitionStart', to, params, from, fromParams);
    }

  };

  return machine;
}
