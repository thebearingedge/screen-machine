
'use strict';

import BaseResolve from './BaseResolve';

class SimpleResolve extends BaseResolve {

  constructor(resolveKey, state, Promise) {
    super(resolveKey, state, Promise);
    this.invokable = state.resolve[resolveKey];
  }

  execute() {
    return this.invokable(...arguments);
  }

}

export default SimpleResolve;
