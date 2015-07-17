
'use strict';

module.exports = Viewport;

function Viewport(name) {

  this.name = name;
  this.selector = name.indexOf('@') > -1
    ? 'sm-viewport:not([name])'
    : 'sm-viewport[name="' + name + '"]';
}


Viewport.prototype.element = null;


Viewport.prototype.currentView = null;


Viewport.prototype.previousView = null;


Viewport.prototype.attachTo = function (node) {

  this.element = node;

  return this;
};


Viewport.prototype.attachWithin = function (node) {

  this.element = node.querySelector(this.selector);

  return this;
};


Viewport.prototype.detach = function () {

  this.element = null;

  return this;
};


Viewport.prototype.getChildren = function () {

  return this.currentView.getViewports();
};


Viewport.prototype.setView = function (view) {

  if (this.currentView) return this.replaceView(view);

  this.currentView = view;

  return this;
};


Viewport.prototype.replaceView = function (newView) {

  this.previousView = this.currentView;
  this.currentView = newView;

  return this;
};


Viewport.prototype.cleanUp = function () {

  var previousView = this.previousView;

  if (!previousView) return this;

  previousView.destroy();

  this.previousView = null;

  return this;
};


Viewport.prototype.update = function (resolveResults) {

  this.currentView.update(resolveResults);

  return this;
};


Viewport.prototype.publish = function (resolveResults) {

  this.element.innerHTML = this.currentView.render(resolveResults);

  return this;
};


Viewport.prototype.isDirty = function () {

  return !!this.previousView;
};

