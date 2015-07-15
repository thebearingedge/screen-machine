
'use strict';

var Viewport = require('./Viewport');

/*
 * State objects can come with view keys that refer to Viewports:
 *
 * views: {
 *  main: { blah blah blah },
 *  'side@home': { blah blah blah }
 * }
 *
 * Different Views may populate the same Viewport at different State. We want
 * the State to hold references to its Viewports. One ocurrence of an implied
 * Viewport is all we need to a) instantiate the viewport and b) add it to the
 * implied State. A given State object may imply a Viewport that exists on a yet
 * unaccounted-for State, so we will queue info about the Viewport until we can
 * actually create it and set it on its State.
 */

module.exports = {

  states: {},


  queues: {},


  stateViewports: {},


  addState: function (state) {

    this.states[state.name] || (this.states[state.name] = state);

    if (!state.hasViews()) return this;

    this.processState(state);
    this.flushQueueOf(state);

    return this;
  },


  processState: function (state) {

    if (!state.views) {

      return this.registerOne(null, state.name);
    }

    return this.registerMany(state.views, state);
  },


  registerOne: function (nameAttr, viewportName, stateName) {

    viewportName || (viewportName = '@' + stateName);
    this.viewports[stateName] || (this.viewports[stateName] = {});

    if (this.viewports[stateName][viewportName]) return;

    var viewport = new Viewport(viewportName);
    var state = this.states[stateName];

    this.viewports[stateName][viewportName] = viewport;

    if (!state) {

      return this.enqueueViewport(viewport, stateName);
    }

    state.$viewports.push(viewport);

    return this;
  },


  registerMany: function (viewDefs, state) {

    var key, splitNames, viewportName, stateName;

    for (key in viewDefs) {

      splitNames = key.split('@');
      viewportName = splitNames[0] || null;
      stateName = splitNames[1] || state.name;

      this.registerOne(viewportName, stateName);
    }
  },


  enqueueViewport: function (viewport, stateName) {

    this.queues[stateName] || (this.queues[stateName] = []);
    this.queues[stateName].push(viewport);

    return this;
  },


  flushQueueOf: function (state) {

    var queue = this.queues[state.name];

    while (queue && queue.length) {

      state.$viewports.push(queue.pop());
    }
  }

};

