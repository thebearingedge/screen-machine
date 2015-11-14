
'use strict';

export default function eventBus(config) {
  const { emitter, trigger, on, off } = config;
  return {
    notify: (...args) => emitter[trigger](...args),
    subscribe: (...args) => emitter[on](...args),
    unsubscribe: (...args) => emitter[off](...args)
  };
}
