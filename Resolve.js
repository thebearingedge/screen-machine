
'use strict';

module.exports = Resolve;


function Resolve(Promise) {

  this.Promise = Promise;
  this._chain = [[]];
  this._resolves = {};
  this._dependents = {};

}


Resolve.prototype.addState = function (state) {

  if (state.hasDependencies()) {

    return this._triageState(state);
  }

  this._registerState(state);

  return this;
};


Resolve.prototype._registerState = function (state, insertDepth) {

  insertDepth || (insertDepth = 0);

  var level = this._chain[insertDepth] || (this._chain[insertDepth] = []);

  var stateResolves = state._resolves;
  var i = stateResolves.length;
  var resolve, position;

  while (i--) {

    resolve = stateResolves[i];
    position = level.length;

    this._resolves[resolve.name] = {
      depth: insertDepth,
      position: position,
      state: state
    };

    level.push(resolve.value);
    this._flushDependentsOf(resolve.name);
  }
};


Resolve.prototype._triageState = function (state) {

  var isReady = true;
  var waitFor = state.waitFor;
  var i = waitFor.length;

  while (i--) {

    if (!this._resolves[waitFor[i]]) {

      isReady = false;
      break;
    }
  }

  if (isReady) {

    var insertDepth = this._getInsertDepth(waitFor);

    return this._registerState(state, insertDepth);
  }

  return this._queueDependent(state);
};


Resolve.prototype._flushDependentsOf = function (resolveName) {

  var queue = this._dependents[resolveName];

  if (!queue) return;

  for (var stateName in queue) {

    this._triageState(queue[stateName]);
  }
};


Resolve.prototype._queueDependent = function (state) {

  var waitingFor = state.waitFor;
  var i = waitingFor.length;
  var dependents = this._dependents;
  var queue;

  while (i--) {

    queue = dependents[waitingFor[i]] || (dependents[waitingFor[i]] = {});
    queue[state.name] = state;
  }

};


Resolve.prototype._getInsertDepth = function (waitFor) {

  var depth = 0;
  var i = waitFor.length;
  var dependencyDepth;

  while (i--) {

    dependencyDepth = this._resolves[waitFor[i]].depth;

    if (depth < dependencyDepth) {

      depth = dependencyDepth;
    }
  }

  return depth + 1;
};
