
'use strict';

module.exports = Viewport;

function Viewport(name, state) {

  this.state = state;
  this.selector = name
    ? 'sm-viewport[name="' + name + '"]'
    : 'sm-viewport';
  this.view = null;
  this.children = [];
}


Viewport.prototype.mountTo = function (fragment) {

  this.element = fragment.querySelector(this.selector);

  return this;
};


Viewport.prototype.unmount = function () {

  this.element = null;

  return this;
};


Viewport.prototype.getChildren = function () {

  return this.view.getViewports();
};


Viewport.prototype.setView = function (view) {

  if (!!this.view) return this.replaceView(view);

  this.view = view;
};


Viewport.prototype.replaceView = function (newView) {

  this.previousView = this.view;
  this.view = newView;
};


Viewport.prototype.cleanUp = function () {

  return this.previousView
    ? this.previousView.destroy()
    : undefined;
};


Viewport.prototype.isDirty = function () {

  return !!this.previousView;
};


Viewport.prototype.close = function () {

  this.view = null;
};
