
'use strict';

var xtend = require('xtend/mutable');


module.exports = State;


function State(definition) {

  this.$definition = definition;
  this.$ancestors = {};
  this.$includes = {};

  xtend(this, definition);

  this.$includes[this.name] = true;
  this.$ancestors[this.name] = this;

  // infer parent state name

  if (!definition.parent) {

    var splitNames = definition.name.split('.');

    this.parent = splitNames[1]
      ? splitNames.slice(0, splitNames.length - 1).join('.')
      : null;
  }

  // gather path segments and query segment from definition

  if (!definition.path) {

    this.$pathSegments = [''];
    this.$querySegment = '';
    this.$paramKeys = [];

  }
  else {

    var pathOnly;
    var querySegment;
    var queryAt = definition.path.indexOf('?');

    if (queryAt > -1) {

      pathOnly = definition.path.slice(0, queryAt);
      querySegment = definition.path.slice(queryAt + 1);
    }
    else {

      pathOnly = definition.path;
      querySegment = '';
    }

    this.$querySegment = querySegment;

    var splitPath = pathOnly.split('/');

    this.$pathSegments = splitPath[0]
      ? splitPath
      : splitPath.slice(1);

    this.$paramKeys = this
      .$pathSegments
      .filter(function (segment) {

        return segment[0] === ':';
      })
      .map(function (dynamic) {

        return dynamic.slice(1);
      });
  }
}


State.prototype.$parent = null;
State.prototype.$branch = null;
State.prototype.$resolves = null;
State.prototype.$views = null;
State.prototype.$components = null;
State.prototype.$paramKeys = null;
State.prototype.$paramCache = null;
State.prototype.$querySegment = null;
State.prototype.$pathSegments = null;


State.prototype.inheritFrom = function (parentNode) {

  this.data = xtend({}, parentNode.data, this.data || {});

  xtend(this.$includes, parentNode.$includes);
  xtend(this.$ancestors, parentNode.$ancestors);

  this.$branch = parentNode
    .getBranch()
    .concat(this);
  this.$pathSegments = parentNode.$pathSegments.concat(this.$pathSegments);
  this.$paramKeys = parentNode.$paramKeys.concat(this.$paramKeys);
  this.$parent = parentNode;

  return this;
};


State.prototype.contains = function (state) {

  return this.$includes[state.name] || false;
};


State.prototype.getBranch = function () {

  return this.$branch
    ? this.$branch.slice()
    : [this];
};


State.prototype.getParent = function () {

  return this.$parent;
};


State.prototype.getAncestor = function (stateName) {

  return this.$ancestors[stateName];
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

  this.$views.forEach(function (view) {

    view.detach();
  });

  this.$resolves.forEach(function (resolve) {

    resolve.clearCache();
  });

  this.$paramCache = null;

  return this;
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


State.prototype.addComponent = function (component) {

  this.$components || (this.$components = []);
  this.$components.push(component);

  return this;
};


State.prototype.getComponents = function () {

  return this.$components
    ? this.$components.slice()
    : [];
};
