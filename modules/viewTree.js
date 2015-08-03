
'use strict';


module.exports = viewTree;


function viewTree(View, Component) {

  var tree = {
    loadedViews: [],
    activeViews: []
  };

  return {

    views: {
      '@': new View('@', tree)
    },


    components: {},


    processState: function (state) {

      var viewKey;
      var componentName;
      var view;

      if (state.views) {

        for (viewKey in state.views) {

          componentName = viewKey;
          view = this.ensureView(viewKey, state);
          this.createComponent(componentName, viewKey, state, view);
        }
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
        .filter(function (component) {

          return component.name === '';
        })[0];

      view.setContainer(container);

      return view;
    },


    createComponent: function (componentName, viewKey, state, view) {

      var component = new Component(componentName, viewKey, state, view);

      view.addComponent(state.name, component);
      state.addComponent(component);

      return component;
    }

  };
}