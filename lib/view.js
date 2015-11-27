'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var View = (function () {
  function View(viewKey, tree) {
    _classCallCheck(this, View);

    var viewName = viewKey.slice(0, viewKey.indexOf('@'));
    var selector = viewName ? 'sm-view[name="' + viewName + '"]' : 'sm-view:not([name])';
    var components = {};
    Object.assign(this, { viewKey: viewKey, tree: tree, viewName: viewName, selector: selector, components: components });
  }

  _createClass(View, [{
    key: 'attachWithin',
    value: function attachWithin(node) {
      var element = node.querySelector(this.selector);
      var content = element ? element.firstElementChild : null;
      return Object.assign(this, { element: element, content: content });
    }
  }, {
    key: 'detach',
    value: function detach() {
      this.close();
      this.element = null;
      return this;
    }
  }, {
    key: 'addComponent',
    value: function addComponent(stateName, component) {
      component.setView(this);
      this.components[stateName] = component;
      return this;
    }
  }, {
    key: 'addChild',
    value: function addChild(view) {
      view.parent = this;
      this.children || (this.children = []);
      this.children.push(view);
      return this;
    }
  }, {
    key: 'setContainer',
    value: function setContainer(component) {
      component.view.addChild(this);
      component.addChildView(this);
      this.container = component;
      return this;
    }
  }, {
    key: 'loadComponent',
    value: function loadComponent(component) {
      if (this.isLoaded()) return this;
      this.nextComponent = component;
      this.tree.loadedViews.push(this);
      return this;
    }
  }, {
    key: 'unload',
    value: function unload() {
      (this.children || []).filter(function (child) {
        return child.isLoaded();
      }).forEach(function (child) {
        return child.unload();
      });
      var loadedViews = this.tree.loadedViews;

      loadedViews.splice(loadedViews.indexOf(this), 1);
      this.nextComponent = null;
      return this;
    }
  }, {
    key: 'isLoaded',
    value: function isLoaded() {
      return this.tree.loadedViews.indexOf(this) > -1;
    }
  }, {
    key: 'isShadowed',
    value: function isShadowed() {
      var container = this.container;

      return !!container && container.view.nextComponent !== container;
    }
  }, {
    key: 'publish',
    value: function publish(resolved, params, query) {
      var currentComponent = this.currentComponent;

      if (this.shouldUpdate()) {
        currentComponent.update(resolved, params, query);
        return this;
      }
      var content = this.content;
      var element = this.element;
      var nextComponent = this.nextComponent;

      if (content) element.replaceChild(nextComponent.node, content);else element.appendChild(nextComponent.node);
      return Object.assign(this, {
        content: nextComponent.node,
        lastComponent: currentComponent,
        currentComponent: nextComponent,
        nextComponent: null
      });
    }
  }, {
    key: 'shouldUpdate',
    value: function shouldUpdate() {
      var currentComponent = this.currentComponent;
      var nextComponent = this.nextComponent;

      return !!currentComponent && currentComponent === nextComponent;
    }
  }, {
    key: 'shouldClose',
    value: function shouldClose() {
      return !this.isLoaded();
    }
  }, {
    key: 'close',
    value: function close() {
      var content = this.content;
      var element = this.element;
      var currentComponent = this.currentComponent;

      if (content) element.removeChild(content);
      if (currentComponent) currentComponent.destroy();
      this.content = this.currentComponent = null;
      return this;
    }
  }, {
    key: 'cleanUp',
    value: function cleanUp() {
      this.lastComponent && this.lastComponent.destroy();
      this.lastComponent = null;
      return this;
    }
  }]);

  return View;
})();

exports.default = View;

View.prototype.parent = null;
View.prototype.children = null;
View.prototype.container = null;
View.prototype.element = null;
View.prototype.content = null;
View.prototype.nextComponent = null;
View.prototype.currentComponent = null;
View.prototype.lastComponent = null;