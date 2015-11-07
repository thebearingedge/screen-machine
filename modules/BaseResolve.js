
'use strict';

class BaseResolve {

  constructor(resolveKey, state, Promise) {
    this.key = resolveKey;
    this.id = resolveKey + '@' + state.name;
    this.Promise = Promise;
    this.cacheable = state.cacheable === false ? false : true;
  }

  clear() {
    const { cache, cacheable, id } = this;
    if (cache && cacheable ) cache.unset(id);
  }

  createTask(params, query, transition, cache) {
    Object.assign(this, { cache });
    const { id, Promise, injectables = [], taskDelegate } = this;
    return Object.assign({ resolve: this }, taskDelegate, {
      id, Promise, params, query, transition, cache
    }, { waitingFor: injectables.slice() });
  }

}


BaseResolve.prototype.taskDelegate = {

  isWaitingFor: function (dependencyId) {
    return this.waitingFor.indexOf(dependencyId) > -1;
  },

  isReady() {
    return !this.waitingFor.length;
  },

  setDependency(dependencyId, result) {
    this.dependencies || (this.dependencies = {});
    this.dependencies[dependencyId] = result;
    this.waitingFor.splice(this.waitingFor.indexOf(dependencyId), 1);
    return this;
  },

  perform() {
    const { Promise, params, query, transition, dependencies } = this;
    return new Promise((resolve, reject) => {
      let resultOrPromise;
      try {
        resultOrPromise = this.resolve
          .execute(params, query, transition, dependencies);
      }
      catch (e) {
        return reject(e);
      }
      return resolve(resultOrPromise);
    });
  },

  runSelf(queue, completed, wait) {
    const { Promise, transition } = this;
    if (queue.indexOf(this) < 0) return Promise.resolve();
    if (transition.isSuperseded()) {
      queue.splice(0);
      return transition._fail('transition superseded');
    }
    queue.splice(queue.indexOf(this), 1);
    return this
      .perform()
      .then(result => {
        this.result = result;
        completed.push(this);
        if (completed.length === wait) return Promise.resolve();
        return this.runDependents(queue, completed, wait);
      });
  },

  runDependents(queue, completed, wait) {
    const { id, result, Promise } = this;
    const nextTasks = queue
      .filter(queued => queued.isWaitingFor(id))
      .map(dependent => dependent.setDependency(id, result))
      .filter(maybeReady => maybeReady.isReady())
      .map(ready => ready.runSelf(queue, completed, wait));
    return Promise.all(nextTasks);
  },

  commit() {
    this.cache.set(this.id, this.result);
  }

};

export default BaseResolve;
