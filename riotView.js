
'use strict';


module.exports = function riotView(riot, document) {

  function RiotTagView(tagName, state, loaderId, viewLoaders) {

    this.$tagName = tagName;
    this.$state = state;
    this.$loaderId = loaderId;
    this.$loaders = viewLoaders;
  }


  RiotTagView.prototype.$element = null;
  RiotTagView.prototype.$children = null;


  RiotTagView.prototype.load = function () {

    this.$loaders[this.$loaderId].loadView(this);

    return this;
  };


  RiotTagView.prototype.render = function () {

    var opts = this.$state.getResolveResults();

    this.$element = document.createElement(this.$tagName);
    this.$tag = riot.mount(this.$element, this.$tagName, opts)[0];

    this.publishChildren();

    return this.$element;
  };


  RiotTagView.prototype.update = function () {

    this.$tag.opts = this.$state.getResolveResults();
    this.$tag.update();

    return this;
  };


  RiotTagView.prototype.destroy = function () {

    if (this.$children) {

        this.$children.forEach(function (viewLoader) {

          viewLoader.detach();
        });
    }

    this.$tag.unmount();
    this.$element = this.$tag = this.$children = null;

    return this;
  };


  RiotTagView.prototype.publishChildren = function () {

    var self = this;

    self.$children = Array
      .prototype
      .slice
      .call(self.$element.querySelectorAll('sm-view'))
      .map(function (element) {

        var viewLoader = self.$loaders[element.id];

        return viewLoader
          .attachTo(element)
          .publish();
      });

    return this;
  };

  return RiotTagView;
};
