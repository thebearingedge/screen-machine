
'use strict';

var slice = [].slice;


module.exports = function (riot, document) {

  RiotTagView.riot = riot;
  RiotTagView.doc = document;

  return RiotTagView;
};


function RiotTagView(tagName, state, viewLoader) {

  this.$tagName = tagName;
  this.$state = state;
  this.$loader = viewLoader;
}


RiotTagView.prototype.$element = null;
RiotTagView.prototype.$children = null;


RiotTagView.prototype.load = function () {

  this.$loader.load(this);

  return this;
};


RiotTagView.prototype.render = function () {

  var opts = this.$state.getResolveResults();

  this.$element = RiotTagView.doc.createElement(this.$tagName);
  this.$tag = RiotTagView.riot.mount(this.$element, this.$tagName, opts)[0];

  this.publishChildren();

  return this.$element;
};


RiotTagView.prototype.update = function () {

  this.$tag.opts = this.$state.getResolveResults();
  this.$tag.update();

  return this;
};


RiotTagView.prototype.destroy = function () {

  this.$children.forEach(function (viewLoader) {

    viewLoader
      .close()
      .detach();
  });

  this.$tag.unmount();
  this.$tag = this.$element = this.$children = null;
};


RiotTagView.prototype.publishChildren = function () {

  var self = this;

  self.$children = slice.call(self.$element.querySelectorAll('sm-viewport'))
    .map(function (element) {

      var viewport = self.viewports[element.id];

      return viewport
        .attachTo(element)
        .pubish();
    });

  return this;
};
