
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
  this._resolves = [];

  this.waitFor = null;
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

      this._resolves.push({
        name: key + '@' + this.name,
        value: this.resolve[key]
      });
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
    ._inheritBranch()
    .initialize();
};


StateNode.prototype._inheritIncludes = function () {

  xtend(this._includes, this._parent._includes);

  return this;
};


StateNode.prototype._inheritData = function () {

  this.data = xtend({}, this._parent.data, this.data);

  return this;
};


StateNode.prototype._inheritBranch = function () {

  this._branch = this._parent._branch.concat(this._branch);

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


StateNode.prototype.isNew = function () {

  return this._params === null;
};


StateNode.prototype._getOwnParams = function (allParams) {

  return this
    ._paramKeys
    .reduce(function (ownParams, key) {
      ownParams[key] = allParams[key];
      return ownParams;
    }, {});
};


StateNode.prototype.load = function (allParams) {

  var ownParams = this._getOwnParams(allParams);

  var resolved;

  if (this._resolves.length !== 0) {

    resolved = this._resolves.map(function (resolveable) {

      if (typeof resolveable.value !== 'function') return resolveable.value;

      return resolveable.value(ownParams);
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


StateNode.prototype.hasDependencies = function () {

  return !!this.waitFor;
};
