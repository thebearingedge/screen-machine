
'use strict';


module.exports = eventBus;


function eventBus(events) {

  var emitter = events.emitter;
  var trigger = events.trigger;

  return {

    notify: function notify() {

      emitter[trigger].apply(emitter, arguments);
    }

  };
}
