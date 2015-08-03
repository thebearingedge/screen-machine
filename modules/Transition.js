
'use strict';


module.exports = Transition;


function Transition(machine) {

  this.machine = machine;
}


Transition.prototype.cancel = false;


Transition.prototype.isSuperceded = function isSuperceded() {

  return this.cancel || (this.cancel = this !== this.machine.transition);
};


Transition.prototype.abort = function () {

  this.cancel = true;

  return this;
};