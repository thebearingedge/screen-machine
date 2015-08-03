
'use strict';

var xtend = require('xtend/mutable');
var BaseComponent = require('./modules/Component');


module.exports = riotComponent;


function riotComponent(riot, document) {


  function RiotComponent() {

    BaseComponent.apply(this, arguments);
  }


  xtend(RiotComponent.prototype, BaseComponent.prototype, {

    constructor: RiotComponent,


    tagInstance: null,


    initialize: function (viewKey, state) {

      this.tagName = state.views
        ? state.views[viewKey].component
        : state.component;
    },


    render: function () {

      var opts = this.state.getResolveResults();

      this.node = document.createElement(this.tagName);
      this.tagInstance = riot.mount(this.node, this.tagName, opts)[0];

      this
        .childViews
        .forEach(function (view) {

          view.attachWithin(this.node);
        }, this);

      return this;
    },


    update: function () {

      this.tagInstance.opts = this.state.getResolveResults();
      this.tagInstance.update();

      return this;
    },


    destroy: function () {

      this.tagInstance.unmount();
      this.tagInstance = this.node = null;

      this
        .childViews
        .forEach(function (view) {

          view.detach();
        });

      return this;
    }

  });

  return RiotComponent;
}
