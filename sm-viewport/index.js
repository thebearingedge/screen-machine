
document.addEventListener('DOMContentLoaded', function () {

  'use strict';

  var slice = [].slice;
  // Viewport surrounds a target element that will contain a rendered view

  function Viewport(name, state) {

    this.name = name;
    this.state = state;
    this.$selector = name.indexOf('@') > -1
      ? 'sm-viewport:not([name])'
      : 'sm-viewport[name="' + name + '"]';
  }


  Viewport.prototype.$root = null;


  Viewport.prototype.$currentView = null;


  Viewport.prototype.$nextView = null;


  Viewport.prototype.$content = null;


  Viewport.prototype.attachTo = function (node) {

    this.$root = node;

    return this;
  };


  Viewport.prototype.isActive = function () {

    return (this.$currentView && this.$content);
  };


  Viewport.prototype.attachWithin = function (node) {

    this.$root = node.querySelector(this.$selector);
  };


  Viewport.prototype.setView = function (view) {

    if (this.$currentView !== view) return this.replaceView(view);

    this.$currentView = view;

    return this;
  };


  Viewport.prototype.replaceView = function (newView) {

    this.$nextView = this.$currentView;
    this.$currentView = newView;

    return this;
  };


  Viewport.prototype.publish = function (opts) {


    if (!this.$content) {

      this.$root.appendChild(this.$currentView.render(opts));
    }
    else {

      this.$root.replaceChild(this.$currentView.render(opts), this.$content);
    }

    this.$content = this.$root.firstElementChild;

    return this;
  };


  Viewport.prototype.refreshView = function (opts) {

    this.$currentView.refresh(opts);

    return this;
  };


  Viewport.prototype.load = function (view, opts) {

    return this
      .setView(view)
      .publish(opts)
      .cleanUp();
  };


  Viewport.prototype.close = function () {

    this.$root.removeChild(this.$content);
    this.$currentView.destroy();
    this.$currentView = this.$content = null;

    return this.cleanUp();
  };


  Viewport.prototype.cleanUp = function () {

    var nextView = this.$nextView;

    if (!nextView) return this;

    nextView.destroy();

    this.$nextView = null;

    return this;
  };


  // View creates and renders to its owning Viewport's child element


  function View(tagName, state, viewports) {

    this.$children = [];
    this.tagName = tagName;
    this.state = state;
    this.viewports = viewports;
  }


  View.prototype.render = function (opts) {

    this.$node = document.createElement(this.tagName);
    this.$riotTag = riot.mount(this.$node, this.tagName, opts)[0];
    this.loadChildren();

    return this.$node;
  };


  View.prototype.refresh = function (opts) {

    this.$riotTag.opts = opts;
    this.$riotTag.update();

    return this;
  };


  View.prototype.destroy = function () {

    this.$children.forEach(function (child) {

      child.close();
    });

    this.$riotTag.unmount();
    this.$riotTag = this.$node = null;
  };


  View.prototype.loadChildren = function () {

    var self = this;

    self.$children = slice.call(self.$node.querySelectorAll('sm-viewport'))
      .map(function (node) {

        var viewportName = node.getAttribute('name');
        var viewport = self.viewports[viewportName];
        var childView = self.state.getViewFor(viewportName);

        return viewport
          .attachTo(node)
          .load(childView, { message: 'I\'m nested!' });
      });

  };
  // PROGRAM




  var viewports = {

  };



  var rootState = {
    name: 'root',
    getViewFor: function (viewportName) {

      viewportName || (viewportName = '');

      return this.$views[viewportName + '@' + this.name];
    }
  };

  var childState = {
    name: 'child',
    getViewFor: function (viewportName) {

      viewportName || (viewportName = '');

      return this.$views[viewportName + '@' + this.name];
    }
  };


  var grandchildState = {
    name: 'grandchild',
    getViewFor: function (viewportName) {

      viewportName || (viewportName = '');

      return this.$views[viewportName + '@' + this.name];
    }
  };


  var appMain = window.appMain = new View('app-main', rootState, viewports);
  var appHome = window.appHome = new View('app-home', childState, viewports);
  var appSide = window.appSide = new View('app-side', childState, viewports);

  rootState.$views = {
    'child1@root': appHome,
    'child2@root': appSide
  };

  childState.$views = {
  };

  grandchildState.$views = {
    '@grandchild': new View('app-home', grandchildState, viewports)
  };

  var root = window.root = new Viewport('root', rootState);
  var child1 = window.child1 = new Viewport('child1' , childState);
  var child2 = window.child2 = new Viewport('child2', childState);
  var grandchild = window.granchild = new Viewport('granchild', grandchildState);

  viewports.root = root;
  viewports.child1 = child1;
  viewports.child2 = child2;
  viewports.grandchild = grandchild;

  root.attachWithin(document.body);

  var button = document.querySelector('button');

  button.onclick = function () {

    if (root.isActive()) {

      return root.close();
    }

    return root.load(appMain, { name: 'World' });
  };

});