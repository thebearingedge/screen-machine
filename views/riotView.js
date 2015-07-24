
'use strict';


module.exports = function riotView(document, riot, router) {

  riot.tag('sm-link', '<a href="{ href }"></yield></a>', function (opts) {

    this.href = router.href(opts.state, opts.params);
  });


  function RiotTagView(tagName, state, loaderId, viewLoaders) {

    this.$tagName = tagName;
    this.$state = state;
    this.$loaderId = loaderId;
    this.$loaders = viewLoaders;
  }


  RiotTagView.prototype.$element = null;
  RiotTagView.prototype.$child = null;


  RiotTagView.prototype.load = function () {

    this.$loaders[this.$loaderId].loadView(this);

    return this;
  };


  RiotTagView.prototype.render = function () {

    var opts = this.$state.getResolveResults();

    this.$element = document.createElement(this.$tagName);
    this.$tag = riot.mount(this.$element, this.$tagName, opts)[0];

    this.publishChild();

    return this.$element;
  };


  RiotTagView.prototype.update = function () {

    this.$tag.opts = this.$state.getResolveResults();
    this.$tag.update();

    return this;
  };


  RiotTagView.prototype.destroy = function () {

    if (this.$child) {

      this.$child.detach();
    }

    this.$tag.unmount();
    this.$element = this.$tag = this.$child = null;

    return this;
  };


  RiotTagView.prototype.publishChild = function () {

    var childElement = this.$element.querySelector('sm-view');

    if (childElement) {

      this.$child = this.$loaders[childElement.id]
        .attachTo(childElement)
        .publish();
    }

    return this;
  };

  return RiotTagView;
};
