
'use strict';

var xtend = require('xtend/mutable');

module.exports = StateNode;

function StateNode(stateDef) {

  if (!(this instanceof StateNode)) {

    return new StateNode(stateDef);
  }

  this._parent = null;
  this._params = null;

  this._includes = {};
  this._branch = [this];
  this._paramKeys = [];
  this._resolveables = [];

  this.data = {};
  this.onEnter = function () {};
  this.onExit = function () {};

  xtend(this, stateDef);

  this._includes[this.name] = true;
  this._registerResolves();
}


StateNode.prototype._registerResolves = function () {

  if (this.resolve) {

    for (var key in this.resolve) {

      this._resolveables.push(this.resolve[key]);
    }
  }

  return this;
};


StateNode.prototype.getParentName = function () {

  if (this.parent) return this.parent;

  var splitNames = this.name.split('.');

  if (splitNames.length === 1) return null;

  splitNames.pop();
  this.parent = splitNames.join('.');

  return this.parent;
};


StateNode.prototype.attachTo = function (parentNode) {

  this._parent = parentNode;

  return this
    ._inheritIncludes()
    ._inheritData()
    ._inheritLineage()
    .initialize();
};


StateNode.prototype._inheritIncludes = function () {

  xtend(this._includes, this._parent._includes);

  return this;
};


StateNode.prototype._inheritData = function () {

  var parentNode = this._parent;

  if (parentNode && parentNode.data) {

    this.data = xtend({}, parentNode.data, this.data);
  }

  return this;
};


StateNode.prototype._inheritLineage = function () {

  var parentNode = this._parent;

  if (parentNode && parentNode._branch) {

    this._branch = parentNode._branch.concat(this._branch);
  }

  return this;
};


StateNode.prototype.contains = function (node) {

  return this._includes[node.name] || false;
};


StateNode.prototype.getBranch = function () {

  return this._branch;
};


StateNode.prototype.isStale = function (newParams) {

  if (this._paramKeys.length === 0) return false;

  if (!this._params) return true;

  var isStale = false;
  var keys = this._paramKeys;
  var i = keys.length;

  while (i--) {
    // jshint eqeqeq: false
    if (this._params[keys[i]] != newParams[keys[i]]) {
      isStale = true;
      break;
    }
  }

  return isStale;
};


StateNode.prototype.getOwnParams = function (allParams) {

  return this
    ._paramKeys
    .reduce(function (ownParams, key) {
      ownParams[key] = allParams[key];
      return ownParams;
    }, {});
};


StateNode.prototype.load = function (allParams) {

  var ownParams = this.getOwnParams(allParams);

  var resolved;

  if (this._resolveables.length !== 0) {

    resolved = this._resolveables.map(function (resolveable) {

      if (typeof resolveable !== 'function') return resolveable;

      return resolveable(ownParams);
    });
  }

  this.onEnter.apply(this, resolved);

  this._params = ownParams;

  this._onExit = function () {
    this.onExit.apply(this, resolved);
    this._onExit = undefined;
  }.bind(this);

};


StateNode.prototype.unload = function () {

  this._onExit();
  this._params = null;
};


StateNode.prototype.initialize = function () {

  return this;
};
