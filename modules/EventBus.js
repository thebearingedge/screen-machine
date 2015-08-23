
'use strict';

module.exports = eventBus;


function eventBus(events) {

  var emitter = events.emitter;
  var trigger = events.trigger;
  var on = events.on;
  var off = events.off;

  return {

    notify: function notify() {

      emitter[trigger].apply(emitter, arguments);
    },

    subscribe: function subscribe() {

      emitter[on].apply(emitter, arguments);
    },

    unsubscribe: function unsubscribe() {

      emitter[off].apply(emitter, arguments);
    }

  };
}
