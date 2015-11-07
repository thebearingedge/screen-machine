
'use strict';

class Transition {

  constructor(_machine, toState, toParams, toQuery) {
    const { $state } = _machine;
    const { current: fromState, params: fromParams, query: fromQuery } = $state;
    Object.assign(this, {
      _machine, fromState, fromParams, fromQuery, toState, toParams, toQuery,
      _canceled: false, _succeeded: false, _tasks: null
    });
  }

  isCanceled() {
    return !this._succeeded && this._canceled;
  }

  isSuperseded() {
    return this !== this._machine.transition;
  }

  isSuccessful() {
    return this._succeeded && !this.isSuperseded();
  }

  cancel() {
    !this._succeeded && (this._canceled = true);
    return this;
  }

  retry() {
    return this.redirect(this.toState, this.toParams, this.toQuery);
  }

  redirect() {
    const { _machine } = this;
    return _machine.transitionTo(...arguments);
  }

  _attempt() {
    if (this.isCanceled()) return this._fail('transition canceled');
    if (this.isSuperseded()) return this._fail('transition superseded');
    const { _tasks, _Promise } = this;
    const queue = _tasks.slice();
    const wait = queue.length;
    const completed = [];
    const toRun = queue
      .filter(task => task.isReady())
      .map(ready => ready.runSelf(queue, completed, wait));
    return _Promise.all(toRun).then(() => this._succeed());
  }

  _fail(reason) {
    return this._Promise.reject(new Error(reason));
  }

  _succeed() {
    this._succeeded = true;
    return this._Promise.resolve(this);
  }

  _commit() {
    const { _machine, toState, toParams, toQuery, _tasks, _cache } = this;
    _machine.init(toState, toParams, toQuery);
    _tasks.forEach(task => _cache.set(task.id, task.result));
    return this;
  }

  _cleanup() {
    this._exiting.forEach(exited => exited.sleep());
    return this;
  }

  _prepare(resolves, _cache, _exiting, _Promise) {
    const { toParams, toQuery } = this;
    const _tasks = resolves.map(resolve => {
      return resolve.createTask(toParams, toQuery, this, _cache);
    });
    Object.assign(this, { _tasks, _cache, _exiting, _Promise });
    if (!_tasks.length) return this;
    const graph = _tasks
      .reduce((graph, task) => {
        graph[task.id] = task.waitingFor;
        return graph;
      }, {});
    _tasks
      .filter(task => !task.isReady())
      .forEach(notReady => {
        notReady
          .waitingFor
          .filter(dependency => !(dependency in graph))
          .forEach(absent => {
            notReady.setDependency(absent, _cache.get(absent));
          });
      });
    assertAcyclic(graph);
    return this;
  }

}

export default Transition;

function assertAcyclic(graph) {

  const VISITING = 1;
  const OK = 2;
  const visited = {};
  const stack = [];
  for (let taskId in graph) visit(taskId);

  function visit(taskId) {
    if (visited[taskId] === OK) return;
    stack.push(taskId);
    if (visited[taskId] === VISITING) {
      stack.splice(0, stack.indexOf(taskId));
      throw new Error('Cyclic resolve dependency: ' + stack.join(' -> '));
    }
    visited[taskId] = VISITING;
    graph[taskId].forEach(visit);
    stack.pop();
    visited[taskId] = OK;
  }
}
