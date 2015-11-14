
'use strict';

import SimpleResolve from './SimpleResolve';
import DependentResolve from './DependentResolve';

export default function resolveFactory(Promise) {

  return {

    instantiate(resolveKey, state) {
      return Array.isArray(state.resolve[resolveKey])
        ? new DependentResolve(...arguments, Promise)
        : new SimpleResolve(...arguments, Promise);
    },

    addTo(state) {
      const { resolve } = state;
      if (!resolve || typeof resolve !== 'object') return;
      Object
        .keys(resolve)
        .forEach(key => state.addResolve(this.instantiate(key, state)));
    }

  };

}
