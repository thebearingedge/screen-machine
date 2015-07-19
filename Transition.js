
'use strict';

module.exports = Transition;


function Transition(machine) {

  this.machine = machine;
}


Transition.prototype.superceded = false;


Transition.prototype.isSuperceded = function () {

  this.superceded = (this !== this.machine.transition);

  return this.superceded;
};