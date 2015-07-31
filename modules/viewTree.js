
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


    processState: function (state) {

      var viewKey;
      var view;

      if (state.views) {

        for (viewKey in state.views) {

          view = this.ensureView(viewKey, state);
          this.createComponent(viewKey, state, view);
        }
      }
      else if (state.component) {

        view = this.ensureView(null, state);
        this.createComponent(view.viewKey, state, view);
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

      var view = this.views[viewKey] = new View(viewKey, tree);
      var targetName = viewKey.slice(viewKey.indexOf('@') + 1);
      var targetState = targetName === state.name
        ? state
        : state.getAncestor(targetName);

      targetState.addView(view);

      var container = targetState
        .getComponents()
        .filter(function (component) {

          return component.name === '';
        })[0];

      view.setContainer(container);

      return view;
    },


    createComponent: function (viewKey, state, view) {

      var component = new Component(viewKey, state, view);

      state.addComponent(component);

      return component;
    }

  };
}