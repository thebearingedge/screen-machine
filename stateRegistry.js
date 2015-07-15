
'use strict';

module.exports = {

  init: function (rootState) {

    this.states = { '': rootState };
    this.$root = rootState;
    this.stateQueues = {};
  },


  add: function (state) {

    var parentName = state.parent;
    var parentState = this.states[parentName];

    if (parentName && !parentState) {

      return this.enqueue(parentName, state);
    }

    this.states[state.name] = state.inheritFrom(parentState || this.$root);
    this.flushQueueOf(state.name);

    return this;
  },


  enqueue: function (parent, state) {

    this.stateQueues[parent] || (this.stateQueues[parent] = []);
    this.stateQueues[parent].push(state);

    return this;
  },


  flushQueueOf: function (stateName) {

    var queue = this.stateQueues[stateName];

    while (queue && queue.length) {

      this.add(queue.pop());
    }
  }

};
