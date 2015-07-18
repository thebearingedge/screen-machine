
'use strict';

var slice = [].slice;

module.exports = RiotTagView;


function RiotTagView(tagName, state, renderer, document, viewports) {

  // I need to derive the target viewport name here
  this.$targetName;
  this.$tagName = tagName;
  this.$state = state;
  this.$riot = renderer;
  this.$doc = document;
  this.$viewports = viewports;
}


RiotTagView.prototype.$children = null;


RiotTagView.prototype.load = function () {

  var targetViewport = this.$viewports[this.$targetName];

  targetViewport.load(this);

  return this;
};


RiotTagView.prototype.render = function () {

  var opts = this.$state.getResolveResults();

  this.$node = this.$doc.createElement(this.tagName);
  this.$tag = this.$riot.mount(this.$node, this.tagName, opts)[0];

  this.publishChildren();

  return this.$node;
};


RiotTagView.prototype.refresh = function () {

  this.$tag.opts = this.$state.getResolveResults();
  this.$tag.update();

  return this;
};


RiotTagView.prototype.destroy = function () {

  this.$children.forEach(function (viewport) {

    viewport
      .close()
      .detach();
  });

  this.$tag.unmount();
  this.$tag = this.$node = this.$children = null;
};


RiotTagView.prototype.publishChildren = function () {

  var self = this;

  self.$children = slice.call(self.$node.querySelectorAll('sm-viewport'))
    .map(function (node) {

      var viewport = self.viewports[node.id];

      return viewport
        .attachTo(node)
        .pubish();
    });
};
