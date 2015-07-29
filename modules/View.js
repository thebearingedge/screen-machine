
'use strict';


module.exports = View;


function View(id, viewTree) {

  this.id = id;
  this.components = {};
  this.tree = viewTree;
}


View.prototype.domNode = null;
View.prototype.nextComponent = null;


View.prototype.detach = function () {

  this.domNode = null;

  return this;
};


View.prototype.addComponent = function (stateName, component) {

  component.setView(this);
  this.components[stateName] = component;

  return this;
};


View.prototype.setParent = function (view) {

  this.parent = view;

  return this;
};


View.prototype.addChild = function (view) {

  this.children || (this.children = []);
  this.children.push(view);

  view.setParent(this);

  return this;
};


View.prototype.setContainer = function (component) {

  this.container = component;

  return this;
};


View.prototype.isShadowed = function () {

  return this.container !== this.parent.nextComponent;
};


View.prototype.unload = function () {

  if (this.children) {

    this.children.forEach(function (child) {

      child.unload();
    });
  }

  var loadedViews = this.tree.loadedViews;

  loadedViews.splice(loadedViews.indexOf(this), 1);
  this.nextComponent = null;

  return this;
};


View.prototype.isActive = function () {

  return !!this.tree.activeViews[this.id];
};


View.prototype.isLoaded = function () {

  return !!this.nextComponent;
};

