
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
  this._ancestors = {};
  this._paramKeys = [];
  this._resolves = [];
  this._resolutions = null;

  this.data = {};
  this.onEnter = function () {};
  this.onExit = function () {};

  xtend(this, stateDef);

  this._includes[this.name] = true;
  this._ancestors[this.name] = this;
  this._normalizeResolves();
}


StateNode.prototype._normalizeResolves = function () {

  this.resolve || (this.resolve = {});

  for (var key in this.resolve) {

    if (Array.isArray(this.resolve[key])) {

      this._normalizeDependenciesOf(this.resolve[key]);
    }

    this.resolve[key + '@' + this.name] = this.resolve[key];
  }

  return this;
};


StateNode.prototype._normalizeDependenciesOf = function (invokable) {

  var i = invokable.length - 1;
  var dependency;

  while (i--) {

    dependency = invokable[i];

    if (dependency.indexOf('@') === -1) {

      invokable[i] = dependency + '@' + this.name;
    }
  }
};


StateNode.prototype.getParentName = function () {

  if (this.parent !== undefined) return this.parent;

  var splitNames = this.name.split('.');

  if (splitNames.length === 1) {

    this.parent = null;
  }
  else {

    splitNames.pop();
    this.parent = splitNames.join('.');
  }

  return this.parent;
};


StateNode.prototype.attachTo = function (parentNode) {

  this._parent = parentNode;

  return this
    ._inheritIncludes()
    ._inheritData()
    ._inheritBranch()
    ._inheritAncestors()
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


StateNode.prototype._inheritAncestors = function () {

  xtend(this._ancestors, this._parent._ancestors);

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

  var self = this;

  return self._paramKeys.some(function (key) {

    return self._params[key] != newParams[key];
  });
};


StateNode.prototype.filterParams = function (allParams) {

  return this
    ._paramKeys
    .reduce(function (ownParams, key) {
      ownParams[key] = allParams[key];
      return ownParams;
    }, {});
};


StateNode.prototype.initialize = function () {

  return this;
};
