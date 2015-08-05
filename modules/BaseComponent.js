
'use strict';


module.exports = BaseComponent;


function BaseComponent(componentName, viewKey, state) {

  this.name = componentName;
  this.state = state;
  this.childViews = [];
  this.initialize(viewKey, state);
}


BaseComponent.prototype.node = null;
BaseComponent.prototype.initialize = function () {};


BaseComponent.prototype.setView = function (view) {

  this.view = view;

  return this;
};


BaseComponent.prototype.addChildView = function (view) {

  this.childViews.push(view);

  return this;
};


BaseComponent.prototype.shouldRender = function () {

  return this.view.nextComponent === this &&
    this.view.currentComponent !== this;
};


BaseComponent.prototype.load = function () {

  this.view.loadComponent(this);

  return this;
};
