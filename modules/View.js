
'use strict';


module.exports = View;


function View(viewKey, tree) {

  var atIndex = viewKey.indexOf('@');

  this.viewKey = viewKey;
  this.selector = atIndex === 0
    ? 'sm-view'
    : 'sm-view[id="' + viewKey.slice(0, atIndex) + '"]';
  this.tree = tree;
  this.components = {};
}


View.prototype.parent = null;
View.prototype.children = null;
View.prototype.container = null;
View.prototype.domNode = null;
View.prototype.nextComponent = null;


View.prototype.detach = function () {

  this.domNode = null;

  return this;
};


View.prototype.addComponent = function (stateName, component) {

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

  this.container = component;
  component.view.addChild(this);

  return this;
};


View.prototype.isActive = function () {

  return !!this.tree.activeViews[this.viewKey];
};


View.prototype.loadComponent = function (component) {

  if (this.isLoaded()) return this;

  this.nextComponent = component;

  return this;
};


View.prototype.unload = function () {

  if (this.children) {

    this.children.forEach(function (child) {

      child.unload();
    });
  }

  this.nextComponent = null;
};


View.prototype.isLoaded = function () {

  return !!this.nextComponent;
};


View.prototype.isShadowed = function () {

  return !this.container.willPublish();
};
