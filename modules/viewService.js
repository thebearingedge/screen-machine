
'use strict';

var Viewport = require('./Viewport');


module.exports = viewService;


function viewService(View) {

  return {

    states: {},


    viewports: {
      '': new Viewport()
    },


    buildViewsFor: function (state) {

      this.states[state.name] = state;

      if (!state.component) return this;

      return this
        .inferLoadersFrom(state)
        .addViewsTo(state);
    },


    inferLoadersFrom: function (state) {

      var stateName = state.name;
      var parentName = state.parent;

      if (parentName && !this.viewports[parentName]) {

        var parentLoader = new Viewport(parentName);
        this.viewports[parentName] = parentLoader;
        this.states[parentName].addViewport(parentLoader);
      }

      if (state.preload && !this.viewports[stateName]) {

        var stateViewport = new Viewport(stateName);
        this.viewports[stateName] = stateViewport;
        state.addViewport(stateViewport);
      }

      return this;
    },


    addViewsTo: function (state) {

      var viewports = this.viewports;

      ['component', 'preload']
        .forEach(function (key) {

          var viewportId, view;

          if (!state[key]) return;

          viewportId = key === 'component'
            ? state.parent || ''
            : state.name;

          view = new View(state[key], state, viewportId, viewports);

          state.addView(view);
        });

      return this;
    }

  };

}
