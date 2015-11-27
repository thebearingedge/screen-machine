"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = eventBus;
function eventBus(config) {
  var emitter = config.emitter;
  var trigger = config.trigger;
  var on = config.on;
  var off = config.off;

  return {
    notify: function notify() {
      return emitter[trigger].apply(emitter, arguments);
    },
    subscribe: function subscribe() {
      return emitter[on].apply(emitter, arguments);
    },
    unsubscribe: function unsubscribe() {
      return emitter[off].apply(emitter, arguments);
    }
  };
}