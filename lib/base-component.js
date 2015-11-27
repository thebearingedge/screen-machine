"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseComponent = (function () {
  function BaseComponent(componentName, viewKey, state) {
    _classCallCheck(this, BaseComponent);

    this.name = componentName;
    this.state = state;
    this.childViews = [];
    this.node = null;
  }

  _createClass(BaseComponent, [{
    key: "setView",
    value: function setView(view) {
      this.view = view;
      return this;
    }
  }, {
    key: "addChildView",
    value: function addChildView(view) {
      this.childViews.push(view);
      return this;
    }
  }, {
    key: "shouldRender",
    value: function shouldRender() {
      var view = this.view;

      return !view.isShadowed() && view.nextComponent === this && view.currentComponent !== this;
    }
  }, {
    key: "load",
    value: function load() {
      this.view.loadComponent(this);
      return this;
    }
  }]);

  return BaseComponent;
})();

exports.default = BaseComponent;