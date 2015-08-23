
'use strict';

var State = require('./State');


module.exports = stateRegistry;


function stateRegistry() {

  return {

    $root: new State({ name: '' }),


    states: {},


    queues: {},


    add: function (name, definition) {

      if (arguments.length === 2) definition.name = name;
      else definition = name;

      if (!definition.name || typeof definition.name !== 'string') {

        throw new Error('State definitions must include a string name');
      }

      var state = new State(definition);

      this.register(state);
      return state;
    },


    register: function (state) {

      var parentName = state.parent;
      var parentState = this.states[parentName];

      if (parentName && !parentState) {

        return this.enqueue(parentName, state);
      }

      this.states[state.name] = state.inheritFrom(parentState || this.$root);
      return this.flushQueueFor(state);
    },


    enqueue: function (parentName, state) {

      this.queues[parentName] || (this.queues[parentName] = []);
      this.queues[parentName].push(state);
      return this;
    },


    flushQueueFor: function (state) {

      var queue = this.queues[state.name];

      while (queue && queue.length) {

        this.register(queue.pop());
      }

      return this;
    }

  };
}
