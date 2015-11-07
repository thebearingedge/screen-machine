
'use strict';

import BaseResolve from './BaseResolve';

class SimpleResolve extends BaseResolve {

  constructor(resolveKey, state, Promise) {
    super(resolveKey, state, Promise);
    this.invokable = state.resolve[resolveKey];
  }

  execute(params, query, transition) {
    return this.invokable.call(null, params, query, transition);
  }

}

export default SimpleResolve;
