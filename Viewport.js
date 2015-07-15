
'use strict';

module.exports = Viewport;

function Viewport(name) {

  this.selector = name
    ? 'sm-viewport[name="' + name + '"]'
    : 'sm-viewport';
  this.view = null;
  this.children = [];
}


Viewport.prototype.attachTo = function (node) {

  this.element = node.querySelector(this.selector);

  return this;
};


Viewport.prototype.appearsDuring = function (state) {

  return this.state === state;
};


Viewport.prototype.detach = function () {

  this.element = null;

  return this;
};


Viewport.prototype.getChildren = function () {

  return this.view.getViewports();
};


Viewport.prototype.setView = function (view) {

  if (!!this.view) return this.replaceView(view);

  this.view = view;

  return this;
};


Viewport.prototype.replaceView = function (newView) {

  this.previousView = this.view;
  this.view = newView;

  return this;
};


Viewport.prototype.cleanUp = function () {

  var previousView = this.previousView;

  if (!previousView) return;

  previousView.destroy();

  this.previousView = null;

  return this;
};


Viewport.prototype.isDirty = function () {

  return !!this.previousView;
};


Viewport.prototype.close = function () {

  this.view = null;
};
