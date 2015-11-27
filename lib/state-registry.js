'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = stateRegistry;

var _state = require('./state');

var _state2 = _interopRequireDefault(_state);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stateRegistry() {

  var rootState = new _state2.default({ name: '' });

  return {

    $root: rootState,

    states: { '': rootState },

    queues: {},

    add: function add(name, definition) {
      if (arguments.length === 2) definition.name = name;else definition = name;
      if (!definition.name || typeof definition.name !== 'string') {
        throw new Error('State definitions must include a string name');
      }
      var state = new _state2.default(definition);
      this.register(state);
      return state;
    },
    register: function register(state) {
      var states = this.states;

      var parentName = state.parent;
      var parentState = states[parentName];
      if (parentName && !parentState) return this.enqueue(parentName, state);
      states[state.name] = state.inheritFrom(parentState || this.$root);
      this.flushQueueFor(state);
    },
    enqueue: function enqueue(parentName, state) {
      this.queues[parentName] || (this.queues[parentName] = []);
      this.queues[parentName].push(state);
    },
    flushQueueFor: function flushQueueFor(state) {
      var queue = this.queues[state.name];
      while (queue && queue.length) {
        this.register(queue.pop());
      }
    }
  };
}