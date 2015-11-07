
'use strict';

import SimpleResolve from './SimpleResolve';
import DependentResolve from './DependentResolve';

export default function resolveFactory(Promise) {

  return {

    instantiate(resolveKey, state) {
      const args = [resolveKey, state, Promise];
      return Array.isArray(state.resolve[resolveKey])
        ? new DependentResolve(...args)
        : new SimpleResolve(...args);
    },

    addTo(state) {
      if (typeof state.resolve !== 'object') return;
      Object
        .keys(state.resolve)
        .forEach(resolveKey => {
          state.addResolve(this.instantiate(resolveKey, state));
        });
    }

  };

}
