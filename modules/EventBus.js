
'use strict';

export default function eventBus(eventsConfig) {
  const { emitter, trigger, on, off } = eventsConfig;
  return {
    notify: (...args) => emitter[trigger](...args),
    subscribe: (...args) => emitter[on](...args),
    unsubscribe: (...args) => emitter[off](...args)
  };
}
