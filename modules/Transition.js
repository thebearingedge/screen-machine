
'use strict';


module.exports = Transition;


function Transition(machine, toState, toParams, toQuery) {

  this.machine = machine;
  this.toState = toState;
  this.toParams = toParams;
  this.toQuery = toQuery;
  this.fromState = machine.$state.current;
  this.fromParams = machine.$state.params;
  this.fromQuery = machine.$state.query;
}


Transition.prototype.canceled = false;
Transition.prototype.succeeded = false;
Transition.prototype.error = null;
Transition.prototype.handled = null;
Transition.prototype.resolved = null;


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

  if (!this.canceled && this !== this.machine.$state.transition) {

    this.canceled = true;
  }

  return this.canceled;
};


Transition.prototype.isSuccessful = function isSuccessful() {

  return this.succeeded;
};


Transition.prototype.cancel = function () {

  this.canceled = true;

  return this;
};


Transition.prototype.finish = function () {

  this.succeeded = true;
  this.machine.init(this.toState, this.toParams, this.toQuery);
};


Transition.prototype.cleanup = function () {

  this.fromState
    .getBranch()
    .filter(function (state) {

      return !this.toState.contains(state);
    }, this)
    .forEach(function (exiting) {

      exiting.sleep();
    });
};


Transition.prototype.redirect = function () {

  return this.machine.transitionTo.apply(this.machine, arguments);
};


Transition.prototype.retry = function () {

  return this.redirect(this.toState, this.toParams, this.toQuery);
};
