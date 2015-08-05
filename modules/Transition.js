
'use strict';


module.exports = Transition;


function Transition(machine) {

  this.machine = machine;
}


Transition.prototype.cancelled = false;


Transition.prototype.isSuperceded = function isSuperceded() {

  return this.cancelled || (this.cancelled = this !== this.machine.transition);
};


Transition.prototype.abort = function () {

  this.cancelled = true;

  return this;
};