
document.addEventListener('DOMContentLoaded', function () {

  'use strict';


  // Viewport surrounds a target element that will contain a rendered view

  function Viewport(name) {

    this.name = name;
    this.selector = name.indexOf('@') > -1
      ? 'sm-viewport:not([name])'
      : 'sm-viewport[name="' + name + '"]';
  }


  Viewport.prototype.$root = null;


  Viewport.prototype.$currentView = null;


  Viewport.prototype.$previousView = null;


  Viewport.prototype.$content = null;


  Viewport.prototype.attachTo = function (node) {

    this.$root = node.querySelector(this.selector);

    return this;
  };


  Viewport.prototype.setView = function (view) {

    if (this.$currentView !== view) return this.replaceView(view);

    this.$currentView = view;

    return this;
  };


  Viewport.prototype.replaceView = function (newView) {

    this.$previousView = this.$currentView;
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

    var previousView = this.$previousView;

    if (!previousView) return;

    previousView.destroy();

    this.$previousView = null;

    return this;
  };


  // View creates and renders to its owning Viewport's child element


  function View(tagName) {

    this.tagName = tagName;
  }


  View.prototype.render = function (opts) {

    this.$node = document.createElement(this.tagName);
    this.$riotTag = riot.mount(this.$node, this.tagName, opts)[0];

    return this.$node;
  };


  View.prototype.refresh = function (opts) {

    this.$riotTag.opts = opts;
    this.$riotTag.update();

    return this;
  };


  View.prototype.destroy = function () {

    this.$node = null;
    this.$riotTag.unmount();
  };



  // PROGRAM


  var root = new Viewport('root');

  root.attachTo(document.body);

  var appMain = new View('app-main');
  var appHome = new View('app-home');

  setTimeout(publishAppMainView, 4000);
  setTimeout(refreshAppMainView, 8000);
  setTimeout(loadAppHomeView, 12000);
  setTimeout(refreshAppHomeView, 16000);
  setTimeout(closeRootViewport, 20000);

  // publishAppMainView();
  // refreshAppMainView();
  // loadAppHomeView();
  // refreshAppHomeView();
  // closeRootViewport();

  function publishAppMainView() {

    var name = 'World';
    var log = '"root" Viewport loading "app-main" component - name: ';
    console.log(log + '\'' + name + '\'');

    root.load(appMain, { name: 'World' });
  }


  function refreshAppMainView() {

    var newName = 'Good lookin\'';
    var log = '"root" Viewport refreshing "app-main" with ';

    console.log(log + '\'' + newName + '\'');

    root.refreshView({ name: newName });
  }


  function loadAppHomeView() {

    var message = 'Greetings from Screen Machine!';
    var log = '"root" Viewport loading "app-home" component - message: ';

    console.log(log + '\'' + message + '\'');

    root.load(appHome, { message: message });
  }


  function refreshAppHomeView() {

    var newMessage = '...goodbye';
    var log = '"root" Viewport refreshing "app-home" with ';

    console.log(log + '\'' + newMessage + '\'');

    root.refreshView({ message: newMessage });
  }


  function closeRootViewport() {

    console.log('"root" Viewport now closing.');

    root.close();
  }

});