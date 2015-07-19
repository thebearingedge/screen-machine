
'use strict';

var ViewLoader = require('./ViewLoader');


module.exports = {

  config: function (View) {

    this.View = View;
  },


  defaultViews: {},


  states: {},


  loaders: {},


  processState: function (state) {

    this.states[state.name] || (this.states[state.name] = state);

    if (!state.views && !state.template) return this;

    return this
      .inferLoadersFrom(state)
      .addViewsTo(state);
  },


  inferLoadersFrom: function (state) {

    if (!state.views) {

      return this.createViewLoader(null, state);
    }

    var loaderId, targetStateName, targetState;

    for (loaderId in state.views) {

      targetStateName = loaderId.split('@')[1] || state.name;
      targetState = this.states[targetStateName];
      this.createViewLoader(loaderId, targetState);
    }

    return this;
  },


  createViewLoader: function (loaderId, targetState) {

    loaderId || (loaderId = '@' + targetState.name);

    if (this.loaders[loaderId]) return this;

    var viewLoader = this.loaders[loaderId] = new ViewLoader(loaderId);
    var defaultView = this.defaultViews[loaderId];

    if (defaultView) {

      viewLoader.setDefault(defaultView);
    }

    targetState.addViewLoader(viewLoader);

    return this;
  },


  addViewsTo: function (state) {

    if (!state.views && !state.template) return this;

    if (!state.views) {

      return this.addOneView(state.template, null, state);
    }

    return this;
  },


  addOneView: function (template, loaderId, state) {

    loaderId || (loaderId = '@' + state.name);

    var viewLoader = this.loaders[loaderId];
    var view = new this.View(template, state, loaderId, viewLoader);

    state.addView(view);

    return this;
  },


  addManyViews: function (state) {

    var loaderId, template;
    var views = state.views;

    for (loaderId in views) {

      template = views[loaderId].template;
      this.addOneView(template, loaderId, state);
    }

    return this;
  }

};
