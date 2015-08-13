
'use strict';

var View = require('./View');


module.exports = viewTree;


function viewTree(document, Component) {

  var tree = {
    loadedViews: [],
    activeViews: []
  };

  var rootView = new View('@', tree);

  return {

    $root: rootView,


    views: {
      '@': rootView
    },


    mountRoot: function () {

      rootView.attachWithin(document.body);
      tree.activeViews.push(rootView);
    },


    processState: function (state) {

      var componentName;
      var view;

      if (state.views != null) {

        Object
          .keys(state.views)
          .sort()
          .forEach(function (viewKey) {

            componentName = viewKey;
            view = this.ensureView(viewKey, state);
            this.createComponent(componentName, viewKey, state, view);
          }, this);
      }
      else if (state.component) {

        componentName = '';
        view = this.ensureView(null, state);
        this.createComponent(componentName, view.viewKey, state, view);
      }

      return this;
    },


    ensureView: function (viewKey, state) {

      viewKey || (viewKey = '@' + (state.parent || ''));

      return this.views[viewKey] || this.createView(viewKey, state);
    },


    createView: function (viewKey, state) {

      viewKey = viewKey.indexOf('@') > -1
        ? viewKey
        : viewKey + '@' + state.parent;

      var targetStateName = viewKey.slice(viewKey.indexOf('@') + 1);
      var targetState = targetStateName === state.name
        ? state
        : state.getAncestor(targetStateName);
      var view = this.views[viewKey] = new View(viewKey, tree);

      targetState.addView(view);

      var container = targetState
        .getComponents()
        .sort()[0];

      view.setContainer(container);

      return view;
    },


    createComponent: function (componentName, viewKey, state, view) {

      var component = new Component(componentName, viewKey, state, view);

      view.addComponent(state.name, component);
      state.addComponent(component);

      return component;
    },


    compose: function (components, resolved, params) {

      components
        .map(function (component) {

          return component.load();
        })
        .filter(function (component) {

          return component.shouldRender();
        })
        .forEach(function (component) {

          component.render(resolved, params);
        });

      tree
        .loadedViews
        .filter(function (loaded) {

          return loaded.isShadowed();
        })
        .forEach(function (shadowed) {

          shadowed.unload();
        });

      var toClose = tree
        .activeViews
        .filter(function (active) {

          return !active.isLoaded();
        });

      tree.activeViews = tree.loadedViews.slice();

      tree
        .loadedViews
        .map(function (view) {

          return view.publish(resolved, params);
        })
        .map(function (view) {

          return view.cleanUp();
        });

      toClose
        .forEach(function (view) {

          view.close();
        });

      tree
        .loadedViews
        .slice()
        .forEach(function (view) {

          view.unload();
        });
    }

  };
}