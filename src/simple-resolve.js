
import BaseResolve from './base-resolve'

export default class SimpleResolve extends BaseResolve {

  constructor(resolveKey, state, Promise) {
    super(resolveKey, state, Promise)
    this.invokable = state.resolve[resolveKey]
  }

  execute() {
    return this.invokable(...arguments)
  }

}
