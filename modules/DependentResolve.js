
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
    const args = this
      .injectables
      .map(injectable => dependencies[injectable])
      .concat(params, query, transition);
    return this.invokable(...args);
  }

}

export default DependentResolve;
