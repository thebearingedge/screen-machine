
'use strict';

var ViewLoader = require('./ViewLoader');


module.exports = viewBuilder;


function viewBuilder(View) {

  return {

    states: {},


    viewLoaders: {
      '': new ViewLoader()
    },


    processState: function (state) {

      this.states[state.name] = state;

      if (!state.component) return this;

      return this
        .inferLoadersFrom(state)
        .addViewsTo(state);
    },


    inferLoadersFrom: function (state) {

      var stateName = state.name;
      var parentName = state.parent;

      if (parentName && !this.viewLoaders[parentName]) {

        var parentLoader = new ViewLoader(parentName);
        this.viewLoaders[parentName] = parentLoader;
        this.states[parentName].addViewLoader(parentLoader);
      }

      if (state.preload && !this.viewLoaders[stateName]) {

        var stateLoader = new ViewLoader(stateName);
        this.viewLoaders[stateName] = stateLoader;
        state.addViewLoader(stateLoader);
      }

      return this;
    },


    addViewsTo: function (state) {

      var viewLoaders = this.viewLoaders;

      ['component', 'preload']
        .forEach(function (key) {

          var loaderId, view;

          if (!state[key]) return;

          loaderId = key === 'component'
            ? state.parent || ''
            : state.name;

          view = new View(state[key], state, loaderId, viewLoaders);

          state.addView(view);
        });

      return this;
    }

  };

}
