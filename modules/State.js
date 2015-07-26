
'use strict';

var xtend = require('xtend/mutable');

module.exports = State;


function State(definition) {

  this.$definition = definition;
  this.$includes = {};
  this.$branch = [this];

  xtend(this, definition);

  this.$includes[this.name] = true;

  if (this.parent && typeof this.parent === 'string') return this;

  var splitNames = this.name.split('.');

  this.parent = splitNames[1]
    ? splitNames.slice(0, splitNames.length - 1).join('.')
    : null;
}


State.prototype.$parent = null;
State.prototype.$resolves = null;
State.prototype.$viewports = null;
State.prototype.$views = null;
State.prototype.$paramKeys = null;
State.prototype.$paramCache = null;


State.prototype.inheritFrom = function (parentNode) {

  this.data = xtend({}, parentNode.data, this.data || {});

  xtend(this.$includes, parentNode.$includes);

  this.addParamKeys(parentNode.$paramKeys);
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


State.prototype.getParent = function () {

  return this.$parent;
};


State.prototype.addResolve = function (resolve) {

  this.$resolves || (this.$resolves = []);
  this.$resolves.push(resolve);

  return this;
};


State.prototype.getResolves = function () {

  return this.$resolves
    ? this.$resolves.slice()
    : [];
};


State.prototype.getResolveResults = function (resolveCache) {

  return this
    .$resolves
    .reduce(function (results, resolve) {

      results[resolve.key] = resolveCache.get(resolve.id);

      return results;
    }, {});
};


State.prototype.addParamKeys = function (paramKeys) {

  this.$paramKeys = this.$paramKeys
    ? this.$paramKeys.concat(paramKeys)
    : paramKeys;

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


State.prototype.isStale = function (newParams) {

  if (!this.$resolves) return false;

  if (!this.$paramCache) return true;

  return this.$paramKeys.some(function (key) {

    return this.$paramCache[key] !== newParams[key];
  }, this);
};


State.prototype.sleep = function () {

  this.$viewports.forEach(function (viewLoader) {

    viewLoader.detach();
  });

  this.$resolves.forEach(function (resolve) {

    resolve.clearCache();
  });

  this.$paramCache = null;

  return this;
};


State.prototype.addViewport = function (viewLoader) {

  this.$viewports || (this.$viewports = []);
  this.$viewports.push(viewLoader);

  return this;
};


State.prototype.getViewports = function () {

  return this.$viewports
    ? this.$viewports.slice()
    : [];
};


State.prototype.addView = function (view) {

  this.$views || (this.$views = []);
  this.$views.push(view);

  return this;
};


State.prototype.getViews = function () {

  return this.$views
    ? this.$views.slice()
    : [];
};
