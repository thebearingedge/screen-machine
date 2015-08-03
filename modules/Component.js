
'use strict';


module.exports = Component;


function Component(componentName, viewKey, state) {

  this.name = componentName;
  this.viewKey = viewKey;
  this.state = state;
  this.childViews = [];
}


Component.prototype.setView = function (view) {

  this.view = view;
};


Component.prototype.addChildView = function (view) {

  this.childViews.push(view);

  return this;
};


Component.prototype.shouldRender = function () {

  return this.view.nextComponent === this &&
    this.view.currentComponent !== this;
};


Component.prototype.load = function () {

  this.view.loadComponent(this);

  return this;
};
