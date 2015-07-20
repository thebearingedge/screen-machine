
'use strict';

module.exports = ViewLoader;

function ViewLoader(elementId) {

  this.selector = 'sm-view[id="' + elementId + '"]';
}


ViewLoader.prototype.$element = null;
ViewLoader.prototype.$content = null;
ViewLoader.prototype.$nextContent = undefined;
ViewLoader.prototype.$nextView = undefined;
ViewLoader.prototype.$currentView = null;
ViewLoader.prototype.$lastView = null;
ViewLoader.prototype.$defaultView = null;


ViewLoader.prototype.attachTo = function (element) {

  this.$element = element;

  return this;
};


ViewLoader.prototype.attachWithin = function (element) {

  this.$element = element.querySelector(this.selector);

  return this;
};


ViewLoader.prototype.detach = function () {

  this.$element = null;

  return this
    .close()
    .cleanUp();
};


ViewLoader.prototype.setDefault = function (view) {

  this.$defaultView = view;

  return this;
};


ViewLoader.prototype.load = function (view) {

  if (this.isLoaded() || (view === this.$currentView)) return this;

  this.$nextView = typeof view === 'undefined'
    ? this.$defaultView
    : view;

  this.$nextContent = this.$nextView
    ? this.$nextView.render()
    : undefined;

  return this;
};


ViewLoader.prototype.isLoaded = function () {

  return (typeof this.$nextView !== 'undefined');
};


ViewLoader.prototype.publish = function () {

  if (this.shouldRefresh()) return this.refresh();

  if (this.shouldClose()) return this.close();

  if (this.$content) {

    this.$element.replaceChild(this.$nextContent, this.$content);
  }
  else {

    this.$element.appendChild(this.$nextContent);
  }

  this.$content = this.$nextContent;
  this.$nextContent = undefined;

  this.$currentView = this.$nextView;
  this.$nextView = undefined;

  return this;
};


ViewLoader.prototype.shouldRefresh = function () {

  return !this.isLoaded() && !this.$lastView;
};


ViewLoader.prototype.refresh = function () {

  this.$currentView.update();

  return this;
};


ViewLoader.prototype.shouldClose = function () {

  return this.$nextView === null;
};


ViewLoader.prototype.close = function () {

  if (!this.$element) return this;

  if (this.$content) this.$element.removeChild(this.$content);

  if (this.$currentView) this.$currentView.destroy();

  this.$currentView = this.$content = null;
  this.$nextView = this.$nextContent = undefined;

  return this;
};


ViewLoader.prototype.cleanup = function () {

  if (!this.$lastView) return this;

  this.$lastView.destroy();
  this.$lastView = null;

  return this;
};
