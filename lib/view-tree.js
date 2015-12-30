'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = viewTree;

var _view = require('./view');

var _view2 = _interopRequireDefault(_view);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function viewTree(document, Component) {

  var tree = { loadedViews: [], activeViews: [] };
  var rootView = new _view2.default('@', tree);

  return {

    $root: rootView,

    views: { '@': rootView },

    mountRoot: function mountRoot() {
      rootView.attachWithin(document.body);
      tree.activeViews.push(rootView);
    },
    processState: function processState(state) {
      var _this = this;

      var views = state.views;
      var component = state.component;

      var componentName = undefined;
      var view = undefined;
      if (views) {
        Object.keys(views).forEach(function (viewKey) {
          componentName = viewKey;
          view = _this.ensureView(viewKey, state);
          _this.createComponent(componentName, viewKey, state, view);
        });
      } else if (component) {
        componentName = '';
        view = this.ensureView(null, state);
        this.createComponent(componentName, view.viewKey, state, view);
      }
      return this;
    },
    ensureView: function ensureView(viewKey, state) {
      viewKey || (viewKey = '@' + (state.parent || ''));
      return this.views[viewKey] || this.createView(viewKey, state);
    },
    createView: function createView(viewKey, state) {
      viewKey = viewKey.indexOf('@') > -1 ? viewKey : viewKey + '@' + state.parent;
      var targetStateName = viewKey.slice(viewKey.indexOf('@') + 1);
      var targetState = targetStateName === state.name ? state : state.getAncestor(targetStateName);
      var view = new _view2.default(viewKey, tree);
      this.views[viewKey] = view;
      targetState.addView(view);
      var container = targetState.getComponents().sort()[0];
      view.setContainer(container);
      return view;
    },
    createComponent: function createComponent(componentName, viewKey, state, view) {
      var component = new (Function.prototype.bind.apply(Component, [null].concat(Array.prototype.slice.call(arguments))))();
      view.addComponent(state.name, component);
      state.addComponent(component);
      return component;
    },
    compose: function compose(components, resolved, params, query) {
      components.map(function (component) {
        return component.load();
      }).filter(function (component) {
        return component.shouldRender();
      }).forEach(function (component) {
        return component.render(resolved, params, query);
      });
      var loadedViews = tree.loadedViews;
      var activeViews = tree.activeViews;

      loadedViews.filter(function (loaded) {
        return loaded.isShadowed();
      }).forEach(function (shadowed) {
        return shadowed.unload();
      });
      var toClose = activeViews.filter(function (active) {
        return active.shouldClose();
      });
      tree.activeViews = loadedViews.slice();
      loadedViews.map(function (loaded) {
        return loaded.publish(resolved, params, query);
      }).forEach(function (published) {
        return published.cleanUp();
      });
      toClose.forEach(function (open) {
        return open.close();
      });
      loadedViews.slice().forEach(function (view) {
        return view.unload();
      });
    }
  };
}