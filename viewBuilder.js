
'use strict';

var ViewLoader = require('./ViewLoader');

/*
 * State objects can come with view keys that imply needed ViewLoaders:
 *
 * views: {
 *  main: { blah blah blah },
 *  'side@home': { blah blah blah }
 * }
 *
 * Different Views may populate the same ViewLoader at different States. We want
 * the State to hold references to its ViewLoaders. We only need to create a
 * ViewLoader the first time it is inferred. A given State object
 * may imply a ViewLoader that exists on a yet unaccounted-for State,
 * so we will enqueue the ViewLoader until we can set it on its State.
 */

module.exports = {

  states: {},


  queues: {},


  loaders: {},


  processState: function (state) {

    this.states[state.name] || (this.states[state.name] = state);

    if (!state.definesViews()) return this;

    return this
      .inferLoadersFrom(state)
      .flushQueueOf(state);
  },


  inferLoadersFrom: function (state) {

    if (!state.views) {

      return this.createOne(null, state.name);
    }

    return this.createMany(state);
  },


  createOne: function (loaderId, stateName) {

    loaderId || (loaderId = '@' + stateName);

    if (this.has(loaderId)) return this;

    var viewport = new ViewLoader(loaderId);
    var state = this.states[stateName];

    this.loaders[loaderId] = viewport;

    if (!state) {

      return this.enqueue(viewport, stateName);
    }

    state.addViewLoader(viewport);

    return this;
  },


  createMany: function (state) {

    var key, splitNames, loaderId, stateName;

    for (key in state.views) {

      splitNames = key.split('@');
      loaderId = splitNames[0] || null;
      stateName = splitNames[1] || state.name;

      this.createOne(loaderId, stateName);
    }

    return this;
  },


  enqueue: function (viewport, stateName) {

    this.queues[stateName] || (this.queues[stateName] = []);
    this.queues[stateName].push(viewport);

    return this;
  },


  flushQueueOf: function (state) {

    var queue = this.queues[state.name];

    while (queue && queue.length) {

      state.addViewLoader(queue.pop());
    }

    return this;
  },


  has: function (stateName, loaderId) {

    return !!this.loaders[loaderId];
  }

};
