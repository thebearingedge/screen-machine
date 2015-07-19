
'use strict';

var xtend = require('xtend/mutable');

module.exports = State;

function State(stateDef) {

  this.$definition = stateDef;
  this.$includes = {};
  this.$ancestors = {};
  this.$paramKeys = [];
  this.$resolves = [];
  this.$branch = [this];

  this.data = {};

  xtend(this, stateDef);

  this.$includes[this.name] = true;
  this.$ancestors[this.name] = this;

  if (this.parent && typeof this.parent === 'string') return this;

  var splitNames = this.name.split('.');

  this.parent = splitNames[1]
    ? splitNames.slice(1).join('.')
    : null;
}


State.prototype.$parent = null;
State.prototype.$viewLoaders = null;
State.prototype.$paramCache = null;


State.prototype.inheritFrom = function (parentNode) {

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

  if (!this.$paramsKeys.length && !this.$resolves.length) return false;

  if (!this.$paramCache) return true;

  var self = this;

  return self.$paramsKeys.some(function (key) {

    return self.$paramCache[key] !== newParams[key];
  });
};


State.prototype.getResolveKeys = function () {

  var resolves = this.$definition.resolve;

  return resolves
    ? Object.keys(resolves)
    : [];
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


State.prototype.cacheParams = function (allParams) {

  this.$paramCache = this.filterParams(allParams);

  return this;
};


State.prototype.sleep = function () {

  this.$viewLoaders.forEach(function (viewLoader) {

    viewLoader.detach();
  });
  this.$resolves.forEach(function (resolve) {

    resolve.clearResult();
  });
  this.$params = null;

  return this;
};


State.prototype.getAncestor = function (stateName) {

  return this.$ancestors[stateName] || null;
};


State.prototype.getResolves = function () {

  return this.$resolves.slice();
};


State.prototype.getResolveResults = function () {

  return this
    .$resolves
    .reduce(function (results, resolve) {

      results[resolve.key] = resolve.getResult();

      return results;
    }, {});
};


State.prototype.addViewLoader = function (loader) {

  this.$viewLoaders || (this.$viewLoaders = []);
  this.$viewLoaders.push(loader);

  return this;
};


State.prototype.getViews = function () {

  return this.$views
    ? this.$views.slice()
    : [];
};
