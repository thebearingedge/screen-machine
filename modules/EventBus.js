
'use strict';

export default function eventBus(eventsConfig) {
  const { emitter, trigger, on, off } = eventsConfig;
  return {
    notify: () => emitter[trigger].apply(emitter, arguments),
    subscribe: () => emitter[on].apply(emitter, arguments),
    unsubscribe: () => emitter[off].apply(emitter, arguments)
  };
}
