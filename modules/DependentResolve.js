
'use strict';

import BaseResolve from './BaseResolve';

class DependentResolve extends BaseResolve {

  constructor(resolveKey, state, Promise) {
    super(resolveKey, state, Promise);
    const resolveDef = state.resolve[resolveKey];
    const invokableIndex = resolveDef.length - 1;
    this.invokable = resolveDef[invokableIndex];
    this.injectables = resolveDef
      .slice(0, invokableIndex)
      .map(injectable => {
        return injectable.indexOf('@') > -1
          ? injectable
          : injectable + '@' + state.name;
      });
  }

  execute(params, query, transition, dependencies) {
    const { injectables, invokable } = this;
    const args = injectables.map(injectable => dependencies[injectable]);
    return invokable(...args, params, query, transition);
  }

}

export default DependentResolve;
