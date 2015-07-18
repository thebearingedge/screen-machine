
'use strict';

module.exports = Viewport;

function Viewport(id) {

  this.$id = id;
}


Viewport.prototype.$root = null;
Viewport.prototype.$content = null;
Viewport.prototype.$nextContent = undefined;
Viewport.prototype.$nextView = undefined;
Viewport.prototype.$currentView = null;
Viewport.prototype.$lastView = null;
Viewport.prototype.$defaultView = null;


Viewport.prototype.attachTo = function (node) {

  this.$root = node;

  return this;
};


Viewport.prototype.attachWithin = function (dom) {

  this.$root = dom.querySelector(this.$id);

  return this;
};


Viewport.prototype.detach = function () {

  this.$root = null;

  return this;
};


Viewport.prototype.setDefaultView = function (view) {

  this.$defaultView = view;

  return this;
};


Viewport.prototype.load = function (view) {

  if (typeof this.$nextView !== undefined) return this;

  this.$nextView = typeof view === undefined
    ? this.$defaultView
    : view;

  this.$nextContent = this.$nextView
    ? this.$nextView.render()
    : undefined;

  return this;
};


Viewport.prototype.shouldRefresh = function () {

  return this.$currentView && !this.$nextContent;
};


Viewport.prototype.publish = function () {

  if (!this.$nextView) return this.close();

  var lastContent = this.$content;

  if (lastContent) {

    this.$root.replaceChild(this.$nextContent, lastContent);
  }
  else {

    this.$root.appendChild(this.$nextContent);
  }

  this.$content = this.$nextContent;
  this.$nextContent = undefined;

  this.$currentView = this.$nextView;
  this.$nextView = undefined;

  return this.cleanup();
};


Viewport.prototype.refresh = function () {

  if (this.$currentView) this.$currentView.update();

  return this;
};


Viewport.prototype.close = function () {

  if (!this.$root) return this;

  if (this.$content) this.$root.removeChild(this.$content);

  if (this.$currentView) this.$currentView.destroy();

  this.$currentView = this.$content = null;
  this.$nextView = this.$nextContent = undefined;
};


Viewport.prototype.cleanup = function () {

  if (!this.$lastView) return this;

  this.$lastView.destroy();
  this.$lastView = null;

  return this;
};
