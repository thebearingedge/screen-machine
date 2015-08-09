
'use strict';


module.exports = Transition;


function Transition(machine) {

  this.machine = machine;
}


Transition.prototype.cancelled = false;


Transition.prototype.isSuperceded = function isSuperceded() {

  if (this !== this.machine.transition) {

    this.abort();
  }

  return this.cancelled;
};


Transition.prototype.abort = function () {

  this.cancelled = true;

  return this;
};