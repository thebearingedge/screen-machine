
'use strict';

var Transition = require('./Transition');


module.exports = stateMachine;


function stateMachine(events) {

  var machine = {

    currentState: null,


    currentParams: null,


    transition: null,


    init: function init(startState, startParams) {

      this.currentState = startState;
      this.currentParams = startParams;

      return this;
    },


    transitionTo: function transitionTo(toState, toParams) {

      var transition = new Transition(this);

    },


    changeState: function changeState(results, toState, toParams) {

    }

  };

  return machine;
}
