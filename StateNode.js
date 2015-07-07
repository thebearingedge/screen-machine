
'use strict';

var xtend = require('xtend/mutable');

module.exports = StateNode;

function StateNode(stateDef) {

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

  this.parent = this.getParentName();
}


StateNode.prototype.getParentName = function () {

  if (this.parent !== undefined) return this.parent;

  var splitNames = this.name.split('.');

  if (splitNames.length === 1) {

    return null;
  }
  else {

    splitNames.pop();

    return splitNames.join('.');
  }
};


StateNode.prototype.attachTo = function (parentNode) {

  // inherit includes, data, branch, and ancestry
  xtend(this._includes, parentNode._includes);

  this.data = xtend({}, parentNode.data, this.data);

  this._branch = parentNode._branch.concat(this._branch);

  xtend(this._ancestors, parentNode._ancestors);

  this._parent = parentNode;

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


StateNode.prototype.addResolve = function (resolve) {

  this._resolves.push(resolve);
};


StateNode.prototype.filterParams = function (allParams) {

  return this
    ._paramKeys
    .reduce(function (ownParams, key) {
      ownParams[key] = allParams[key];
      return ownParams;
    }, {});
};
