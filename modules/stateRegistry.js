
'use strict';

module.exports = stateRegistry;


function stateRegistry(State, viewBuilder, resolveService) {

  return {

    init: function (rootState) {

      this.states = { '': rootState };
      this.$root = rootState;
      this.stateQueues = {};
    },


    add: function (name, definition) {

      if (arguments.length === 2) definition.name = name;
      else definition = name;

      if (!definition.name || typeof definition.name !== 'string') {

        throw new Error('State definitions must include a string name');
      }

      var state = new State(definition);

      return this.register(state);
    },


    register: function (state) {

      var parentName = state.parent;
      var parentState = this.states[parentName];

      if (parentName && !parentState) {

        return this.enqueue(parentName, state);
      }

      this.states[state.name] = state.inheritFrom(parentState || this.$root);
      viewBuilder.processState(state);
      resolveService.addResolvesTo(state);

      return this.flushQueueOf(state);
    },


    enqueue: function (parentName, state) {

      this.stateQueues[parentName] || (this.stateQueues[parentName] = []);
      this.stateQueues[parentName].push(state);

      return this;
    },


    flushQueueOf: function (state) {

      var queue = this.stateQueues[state.name];

      while (queue && queue.length) {

        this.register(queue.pop());
      }

      return this;
    }

  };

}
