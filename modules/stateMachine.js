
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

      var transition = new Transition(this);

    },


    changeState: function changeState(results, to, params) {

    }

  };

  return machine;
}
