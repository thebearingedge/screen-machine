
'use strict';

module.exports = Transition;

function Transition(from, to, params, deps) {

  if (!(this instanceof Transition)) {

    return new Transition(from, to, params, deps);
  }

  var $state;

  this._from = from;
  this._to = to;
  this._params = params;
  this._events = {};


  for (var key in deps) {

    switch (key) {
      case 'promise':
        this.Promise = deps[key];
        break;
      default:
        this._emit = deps[key][key].bind(deps[key], from, to, params);
        break;
    }
  }


  this._getCurrentTransition = function () {

    return $state.transition;
  };


  this.start = function (state) {

    $state = state;

    return this;
  };

}


Transition.prototype._transitionIsSuperceded = function () {

  return this !== this._getCurrentTransition();
};


