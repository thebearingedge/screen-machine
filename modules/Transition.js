
'use strict';


module.exports = Transition;


function Transition(machine, to, toParams, from, fromParams) {

  this.machine = machine;
  this.to = to;
  this.toParams = toParams;
  this.from = from;
  this.fromParams = fromParams;
}


Transition.prototype.canceled = false;
Transition.prototype.aborted = false;
Transition.prototype.succeeded = false;
Transition.prototype.handled = null;


Transition.prototype.setError = function (err) {

  this.canceled = true;
  this.aborted = true;
  this.handled = false;
  this.error = err;
};


Transition.prototype.errorHandled = function () {

  this.handled = true;
};


Transition.prototype.isHandled = function () {

  return this.handled;
};


Transition.prototype.isSuperceded = function isSuperceded() {

  if (this.succeeded) return false;

  if (!this.canceled && this !== this.machine.transition) {

    this.canceled = true;
  }

  return this.canceled;
};


Transition.prototype.abort = function () {

  this.canceled = true;
  this.aborted = true;

  return this;
};


Transition.prototype.finish = function () {

  this.succeeded = true;
};


Transition.prototype.redirect = function () {

  return this.machine.transitionTo.apply(this.machine, arguments);
};


Transition.prototype.retry = function () {

  return this.redirect(this.to, this.toParams);
};
