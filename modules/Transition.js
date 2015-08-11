
'use strict';


module.exports = Transition;


function Transition(machine, to, toParams) {

  this.machine = machine;
  this.to = to;
  this.toParams = toParams;
  this.from = machine.currentState;
  this.fromParams = machine.currentParams;
}


Transition.prototype.canceled = false;
Transition.prototype.succeeded = false;
Transition.prototype.error = null;
Transition.prototype.handled = null;


Transition.prototype.setError = function (err) {

  this.canceled = true;
  this.handled = false;
  this.error = err;
};


Transition.prototype.errorHandled = function () {

  this.handled = true;
};


Transition.prototype.isHandled = function () {

  return this.handled;
};


Transition.prototype.isCanceled = function isCanceled() {

  if (this.succeeded) return false;

  if (!this.canceled && this !== this.machine.transition) {

    this.canceled = true;
  }

  return this.canceled;
};


Transition.prototype.cancel = function () {

  this.canceled = true;

  return this;
};


Transition.prototype.finish = function () {

  this.succeeded = true;
  this.machine.init(this.to, this.toParams);
};


Transition.prototype.redirect = function () {

  return this.machine.transitionTo.apply(this.machine, arguments);
};


Transition.prototype.retry = function () {

  return this.redirect(this.to, this.toParams);
};
