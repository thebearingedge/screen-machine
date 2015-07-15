

// // this whole this might not be necessary. if the view knows
// // the unique id of the state it renders within, can we not check at runtime?

// 'use strict';

// module.exports = {

//   states: {},


//   queues: {},


//   add: function (state, view) {

//     this.states[state.id] || (this.states[state.id] = state);

//     var targetStateId = view.targetStateId;
//     var targetState = this.states[targetStateId];

//     if (!targetState) {

//       return this.enqueue(targetStateId, view);
//     }

//     targetState.$views.push(view);
//     this.flushQueueOf(state);

//     return this;
//   },


//   enqueue: function (targetStateId, view) {

//     this.queues[targetStateId] || (this.queues[targetStateId] = []);
//     this.queues[targetStateId].push(view);

//     return this;
//   },


//   flushQueueOf: function (state) {

//     var queue = this.queues[state.id];

//     while (queue && queue.length) {

//       state.$views.push(queue.pop());
//     }
//   }

// };
