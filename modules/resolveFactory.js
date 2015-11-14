
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
      const { resolve } = state;
      if (!resolve || typeof resolve !== 'object') return;
      Object
        .keys(resolve)
        .forEach(resolveKey => {
          state.addResolve(this.instantiate(resolveKey, state));
        });
    }

  };

}
