
'use strict';


module.exports = riotComponent;


function riotComponent(riot, document) {


  function Component(componentName, viewKey, state) {

    this.id = viewKey + ':' + state.name;
    this.name = componentName;
    this.viewKey = viewKey;
    this.state = state;
    this.tagName = state.views
      ? state.views[viewKey].component
      : state.component;
    this.childViews = [];
  }


  Component.prototype.node = null;
  Component.prototype.tag = null;


  Component.prototype.setView = function (view) {

    this.view = view;

    return this;
  };


  Component.prototype.addChildView = function (view) {

    this.childViews.push(view);

    return this;
  };


  Component.prototype.shouldRender = function () {

    return this.view.nextComponent === this &&
      this.view.currentComponent !== this;
  };


  Component.prototype.load = function () {

    this.view.loadComponent(this);

    return this;
  };


  Component.prototype.render = function () {

    var opts = this.state.getResolveResults();

    this.node = document.createElement(this.tagName);
    this.tag = riot.mount(this.node, this.tagName, opts)[0];

    this
      .childViews
      .forEach(function (view) {

        view.attachWithin(this.node);
      }, this);

    return this;
  };


  Component.prototype.update = function () {

    this.tag.opts = this.state.getResolveResults();
    this.tag.update();

    return this;
  };


  Component.prototype.destroy = function () {

    this.tag.unmount();
    this.tag = this.node = null;

    this
      .childViews
      .forEach(function (view) {

        view.detach();
      });

    return this;
  };

  return Component;
}