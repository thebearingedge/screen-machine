
'use strict';

export default function eventBus(eventsConfig) {
  const { emitter, trigger, on, off } = eventsConfig;
  return {
    notify: () => emitter[trigger](...arguments),
    subscribe: () => emitter[on](...arguments),
    unsubscribe: () => emitter[off](...arguments)
  };
}
