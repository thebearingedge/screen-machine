
'use strict';

module.exports = Transition;

function Transition(from, to, params, deps) {

  var $transition;

  this._from = from;
  this._to = to;
  this._params = params;
  this._events = {};

  this.start = this._start.bind(this);

  for (var key in deps) {

    switch (key) {
      case 'promise':
        this.Promise = deps[key];
        break;
      case 'transition':
        $transition = deps[key];
        break;
      default:
        this._emit = deps[key][key].bind(deps[key]);
        break;
    }
  }

  this._getCurrentTransition = function () {

    return $transition;
  };

}


Transition.prototype._transitionIsSuperceded = function () {

  return this !== this._getCurrentTransition();
};
