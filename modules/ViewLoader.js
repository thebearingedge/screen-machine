
'use strict';

module.exports = ViewLoader;


function ViewLoader(stateName) {

  this.selector = stateName
    ? '#' + stateName
    : 'sm-view';
}


ViewLoader.prototype.$element = null;
ViewLoader.prototype.$content = null;
ViewLoader.prototype.$nextContent = undefined;
ViewLoader.prototype.$nextView = undefined;
ViewLoader.prototype.$view = null;
ViewLoader.prototype.$lastView = null;


ViewLoader.prototype.attachTo = function (element) {

  this.$element = element;

  return this;
};


ViewLoader.prototype.attachWithin = function (element) {

  this.$element = element.querySelector(this.selector);

  return this;
};


ViewLoader.prototype.detach = function () {

  this.close();

  this.$element = null;

  return this;
};


ViewLoader.prototype.loadView = function (view) {

  if (this.isLoaded()) return this;

  this.$lastView = this.$view;
  this.$nextView = view;

  return this.renderNextContent();
};


ViewLoader.prototype.renderNextContent = function () {

  this.$nextContent = this.$nextView && this.$nextView !== this.$view
    ? this.$nextView.render()
    : undefined;

  return this;
};


ViewLoader.prototype.isLoaded = function () {

  return (typeof this.$nextView !== 'undefined');
};


ViewLoader.prototype.isActive = function () {

  return !!(this.$view || this.$nextView);
};


ViewLoader.prototype.publish = function () {

  if (!this.isActive()) return this;

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

  this.$lastView = this.$view;
  this.$view = this.$nextView;
  this.$nextView = undefined;

  return this;
};


ViewLoader.prototype.shouldRefresh = function () {

  return this.$view && this.$view === this.$nextView;
};


ViewLoader.prototype.refresh = function () {

  this.$view.update();
  this.$nextView = undefined;

  return this;
};


ViewLoader.prototype.shouldClose = function () {

  return this.$nextView === null;
};


ViewLoader.prototype.close = function () {

  if (this.$element && this.$content) {

    this.$element.removeChild(this.$content);
  }

  if (this.$view) {

    this.$view.destroy();
  }

  this.$view = this.$content = null;
  this.$nextView = this.$nextContent = undefined;

  return this;
};


ViewLoader.prototype.cleanUp = function () {

  if (this.$lastView) {

    this.$lastView.destroy();
    this.$lastView = null;
  }

  return this;
};
