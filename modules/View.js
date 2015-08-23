
'use strict';

module.exports = View;


function View(viewKey, tree) {

  this.viewKey = viewKey;
  this.tree = tree;

  var viewName = viewKey.slice(0, viewKey.indexOf('@'));

  this.selector = viewName
    ? 'sm-view[name="' + viewName + '"]'
    : 'sm-view:not([name])';
  this.components = {};
}


View.prototype.parent = null;
View.prototype.children = null;
View.prototype.container = null;
View.prototype.element = null;
View.prototype.content = null;
View.prototype.nextComponent = null;
View.prototype.currentComponent = null;
View.prototype.lastComponent = null;


View.prototype.attachWithin = function (node) {

  this.element = node.querySelector(this.selector);
  this.content = this.element
    ? this.element.firstElementChild
    : null;
  return this;
};


View.prototype.detach = function () {

  this.close();
  this.element = null;
  return this;
};


View.prototype.addComponent = function (stateName, component) {

  component.setView(this);
  this.components[stateName] = component;
  return this;
};


View.prototype.addChild = function (view) {

  view.parent = this;

  this.children || (this.children = []);
  this.children.push(view);
  return this;
};


View.prototype.setContainer = function (component) {

  component.view.addChild(this);
  component.addChildView(this);
  this.container = component;
  return this;
};


View.prototype.loadComponent = function (component) {

  if (this.isLoaded()) return this;

  this.nextComponent = component;
  this.tree.loadedViews.push(this);
  return this;
};


View.prototype.unload = function () {

  if (this.children) {

    this
      .children
      .filter(function (child) {

        return child.isLoaded();
      }, this)
      .forEach(function (child) {

        child.unload();
      });
  }

  var loadedViews = this.tree.loadedViews;

  loadedViews.splice(loadedViews.indexOf(this), 1);
  this.nextComponent = null;
  return this;
};


View.prototype.isLoaded = function () {

  return this.tree.loadedViews.indexOf(this) > -1;
};


View.prototype.isShadowed = function () {

  return !!this.container &&
    this.container.view.nextComponent !== this.container;
};


View.prototype.publish = function (resolved, params, query) {

  if (this.shouldUpdate()) {

    this.currentComponent.update(resolved, params, query);
    return this;
  }

  if (this.content) {

    this.element.replaceChild(this.nextComponent.node, this.content);
  }
  else {

    this.element.appendChild(this.nextComponent.node);
  }

  this.content = this.nextComponent.node;
  this.lastComponent = this.currentComponent;
  this.currentComponent = this.nextComponent;
  this.nextComponent = null;
  return this;
};


View.prototype.shouldUpdate = function () {

  return !!this.currentComponent &&
    (this.currentComponent === this.nextComponent);
};


View.prototype.shouldClose = function () {

  return !this.isLoaded();
};


View.prototype.close = function () {

  if (this.content) {

    this.element.removeChild(this.content);
  }

  if (this.currentComponent) {

    this.currentComponent.destroy();
  }

  this.content = this.currentComponent = null;
  return this;
};


View.prototype.cleanUp = function () {

  if (this.lastComponent) {

    this.lastComponent.destroy();
  }

  this.lastComponent = null;

  return this;
};
