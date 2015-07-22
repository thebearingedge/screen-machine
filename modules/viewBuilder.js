
'use strict';

var ViewLoader = require('./ViewLoader');


module.exports = {

  config: function (View) {

    this.View = View;
  },


  defaultViews: null,


  setDefaultViews: function (defaultViews) {

    this.defaultViews = defaultViews;

    return this;
  },


  states: {},


  viewLoaders: {},


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

    var loaderId;
    var targetStateName;
    var targetState;

    for (loaderId in state.views) {

      targetStateName = loaderId.split('@')[1] || state.name;
      targetState = this.states[targetStateName];
      this.createViewLoader(loaderId, targetState);
    }

    return this;
  },


  createViewLoader: function (loaderId, state) {

    loaderId || (loaderId = '@' + state.name);

    if (this.viewLoaders[loaderId]) return this;

    var viewLoader = this.viewLoaders[loaderId] = new ViewLoader(loaderId);
    var defaultView = this.defaultViews
      ? this.defaultViews[loaderId]
      : null;

    viewLoader.setDefault(defaultView);
    state.addViewLoader(viewLoader);

    return this;
  },


  addViewsTo: function (state) {

    if (!state.views && !state.template) return this;

    if (!state.views) {

      return this.createView(state.template, null, state);
    }

    var loaderId;
    var template;

    for (loaderId in state.views) {

      template = state.views[loaderId].template;
      this.createView(template, loaderId, state);
    }

    return this;
  },


  createView: function (template, loaderId, state) {

    loaderId || (loaderId = '@' + state.name);

    var view = new this.View(template, state, loaderId, this.viewLoaders);

    state.addView(view);

    return this;
  }

};
