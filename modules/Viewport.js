
'use strict';

module.exports = Viewport;


function Viewport(stateName) {

  this.selector = stateName
    ? '#' + stateName
    : 'sm-view';
}


Viewport.prototype.$element = null;
Viewport.prototype.$content = null;
Viewport.prototype.$nextContent = undefined;
Viewport.prototype.$nextView = undefined;
Viewport.prototype.$view = null;
Viewport.prototype.$lastView = null;


Viewport.prototype.attachTo = function (element) {

  this.$element = element;

  return this;
};


Viewport.prototype.attachWithin = function (element) {

  this.$element = element.querySelector(this.selector);

  return this;
};


Viewport.prototype.detach = function () {

  this.close();

  this.$element = null;

  return this;
};


Viewport.prototype.loadView = function (view) {

  if (this.isLoaded()) return this;

  this.$lastView = this.$view;
  this.$nextView = view;

  return this.renderNextContent();
};


Viewport.prototype.renderNextContent = function () {

  this.$nextContent = this.$nextView && this.$nextView !== this.$view
    ? this.$nextView.render()
    : undefined;

  return this;
};


Viewport.prototype.isLoaded = function () {

  return (typeof this.$nextView !== 'undefined');
};


Viewport.prototype.isActive = function () {

  return !!(this.$view || this.$nextView);
};


Viewport.prototype.publish = function () {

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


Viewport.prototype.shouldRefresh = function () {

  return this.$view && this.$view === this.$nextView;
};


Viewport.prototype.refresh = function () {

  this.$view.update();
  this.$nextView = undefined;

  return this;
};


Viewport.prototype.shouldClose = function () {

  return this.$nextView === null;
};


Viewport.prototype.close = function () {

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


Viewport.prototype.cleanUp = function () {

  if (this.$lastView) {

    this.$lastView.destroy();
    this.$lastView = null;
  }

  return this;
};
