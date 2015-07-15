
'use strict';

var xtend = require('xtend/mutable');

module.exports = State;

function State(stateDef) {

  this.$parent = null;

  this.$includes = {};
  this.$ancestors = {};
  this.$paramKeys = [];
  this.$resolves = [];
  this.$views = [];
  this.$branch = [this];

  this.data = {};
  this.onEnter = function () {};
  this.onExit = function () {};

  xtend(this, stateDef);

  this.$includes[this.name] = true;
  this.$ancestors[this.name] = this;

  this.parent = this.getParentName();
}


State.prototype.getParentName = function () {

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


State.prototype.inheritFrom = function (parentNode) {

  // inherit includes, data, branch, and ancestry

  this.data = xtend({}, parentNode.data, this.data);

  xtend(this.$includes, parentNode.$includes);
  xtend(this.$ancestors, parentNode.$ancestors);

  this.$branch = parentNode.$branch.concat(this.$branch);
  this.$parent = parentNode;

  return this;
};


State.prototype.contains = function (state) {

  return this.$includes[state.name] || false;
};


State.prototype.getBranch = function () {

  return this.$branch.slice();
};


State.prototype.isStale = function (newParams) {

  if (this.$paramsKeys.length === 0) return false;

  if (!this.$params) return true;

  var self = this;

  return self.$paramsKeys.some(function (key) {

    return self.$params[key] != newParams[key];
  });
};


State.prototype.addResolve = function (resolve) {

  this.$resolves.push(resolve);

  return this;
};


State.prototype.filterParams = function (allParams) {

  return this
    .$paramKeys
    .reduce(function (ownParams, key) {

      ownParams[key] = allParams[key];

      return ownParams;
    }, {});
};


State.prototype.shutDown = function () {

  this.$views.forEach(function (view) {

    view.destroy();
  });

  this.$params = null;

  return this;
};


State.prototype.getViews = function () {

  return this.$views.slice();
};


State.prototype.getAllViews = function () {

  return this
    .getBranch()
    .reverse()
    .reduce(function (allViews, state) {

      return allViews.concat(state.getViews());
    }, []);
};


State.prototype.getAncestor = function (stateName) {

  return this.$ancestors[stateName];
};


State.prototype.getResolveResults = function () {

  return this
    .$resolves
    .reduce(function (results, resolve) {

      results[resolve.key] = resolve.getResult();

      return results;
    }, {});
};


State.prototype.hasViews = function () {

  return !!this.views || !!this.template;
};
