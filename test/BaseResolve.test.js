
'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import Promise from 'native-promise-only';
import State from '../modules/State';
import BaseResolve from '../modules/BaseResolve';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const { expect } = chai;

describe('BaseResolve', () => {

  let state, cache;

  beforeEach(() => {
    state = new State({
      name: 'foo',
      resolve: { fooResolve: sinon.spy() }
    });
    cache = { unset: sinon.spy() };
  });

  it('should have an id', () => {
    const { id } = new BaseResolve('fooResolve', state, Promise);
    expect(id).to.equal('fooResolve@foo');
  });

  it('should be cacheable by default', () => {
    const { cacheable } = new BaseResolve('fooResolve', state, Promise);
    expect(cacheable).to.equal(true);
  });

  it('should not cacheable if state is not cacheable', () => {
    state.cacheable = false;
    const { cacheable } = new BaseResolve('fooResolve', state, Promise);
    expect(cacheable).to.equal(false);
  });


  describe('.clear()', () => {

    it('should noop if not cacheable', () => {
      const resolve = new BaseResolve('fooResolve', state, Promise);
      resolve.cache = cache;
      resolve.cacheable = false;
      resolve.clear();
      expect(cache.unset.called).to.equal(false);
    });


    it('should clear its cached result', () => {
      const resolve = new BaseResolve('fooResolve', state, Promise);
      resolve.cache = cache;
      resolve.clear();
      expect(cache.unset).to.have.been.calledWithExactly('fooResolve@foo');
    });

  });


  describe('.createTask(params, query, cache)', () => {

    let params, query, transition, cache;

    beforeEach(() => {
      params = { baz: 42 };
      query = { qux: 'quux' };
      cache = { set: sinon.spy() };
      transition = {};
    });

    it('should reference the cache and create a task delegate', () => {
      const resolve = new BaseResolve('fooResolve', state, Promise);
      const task = resolve.createTask(params, query, transition, cache);
      expect(resolve.cache).to.equal(cache);
      expect(task).to.be.ok;
    });


    it('should copy a dependency list to the task', () => {
      const resolve = new BaseResolve('fooResolve', state, Promise);
      resolve.injectables = ['grault', 'garply'];
      const task = resolve.createTask(params, query, cache);
      expect(task.waitingFor).to.deep.equal(resolve.injectables);
      expect(task.waitingFor).not.to.equal(resolve.injectables);
    });


    describe('taskDelegate', () => {

      let fooResolve, barResolve, bazResolve;
      let fooTask, barTask, bazTask;
      let params, query, cache;
      let transition;

      beforeEach(() => {
        const state = new State({
          name: 'state',
          resolve: {
            foo: sinon.spy(),
            bar: ['foo', sinon.spy()],
            baz: ['foo', 'bar', sinon.spy()]
          }
        });
        fooResolve = new BaseResolve('foo', state, Promise);
        barResolve = new BaseResolve('bar', state, Promise);
        bazResolve = new BaseResolve('bar', state, Promise);
        barResolve.injectables = ['foo@state'];
        bazResolve.injectables = ['foo@state', 'bar@state'];
        params = { qux: 'quux' };
        query = { grault: 'garply' };
        transition = {};
        cache = { set: sinon.spy() };
        fooTask = fooResolve.createTask(params, query, transition, cache);
        barTask = barResolve.createTask(params, query, transition, cache);
        bazTask = bazResolve.createTask(params, query, transition, cache);
      });

      describe('.isReady()', () => {

        it('should whether it is ready', () => {
          expect(fooTask.isReady()).to.equal(true);
          expect(barTask.isReady()).to.equal(false);
          expect(bazTask.isReady()).to.equal(false);
        });

      });

      describe('.isWaitingFor(dependencyId)', () => {

        it('should know who it is waiting for', () => {
          expect(barTask.isWaitingFor('foo@state')).to.equal(true);
          expect(barTask.isWaitingFor('baz@state')).to.equal(false);
          expect(bazTask.isWaitingFor('foo@state')).to.equal(true);
          expect(bazTask.isWaitingFor('bar@state')).to.equal(true);
        });

      });

      describe('.setDependency(dependencyId, result)', () => {

        it('should store the dependency and stop waiting for it', () => {

          expect(barTask.waitingFor).to.deep.equal(['foo@state']);

          barTask.setDependency('foo@state', 42);

          expect(barTask.waitingFor).to.deep.equal([]);
          expect(barTask.dependencies['foo@state']).to.equal(42);

          expect(bazTask.waitingFor).to.deep.equal(['foo@state', 'bar@state']);

          bazTask.setDependency('foo@state', 42);

          expect(bazTask.waitingFor).to.deep.equal(['bar@state']);
          expect(bazTask.dependencies['foo@state']).to.equal(42);

          bazTask.setDependency('bar@state', 'corge');

          expect(bazTask.waitingFor).to.deep.equal([]);
          expect(bazTask.dependencies['bar@state']).to.equal('corge');
        });

      });


      describe('.perform()', () => {

        it('should call its resolve and return a promise', () => {

          fooResolve.execute = sinon.stub().returns('Yay!');

          const resolve = fooTask.perform();

          expect(fooResolve.execute)
            .to.have.been
            .calledWithExactly(params, query, transition, undefined);

          fooResolve.execute = sinon.stub().throws('Oops!');

          const reject = fooTask.perform();

          return Promise.all([
            expect(resolve).to.eventually.equal('Yay!'),
            expect(reject).to.eventually.be.rejectedWith('Oops!')
          ]);
        });

      });


      describe('.commit()', () => {

        it('should set its result on the cache', () => {
          fooTask.result = 'WHARGARBLE';
          fooTask.commit();
          expect(cache.set)
            .to.have.been.calledWithExactly('foo@state', 'WHARGARBLE');
        });

      });


      describe('.runSelf(transition, queue, complete, wait)', () => {

        it('should run itself and then run dependents', done => {

          transition.isSuperseded = () => false;

          const queue = [fooTask, barTask, bazTask];
          const complete = [];
          const wait = 3;

          sinon.stub(fooTask, 'runDependents');
          fooResolve.execute = sinon.stub().returns('ok');

          return fooTask
            .runSelf(queue, complete, wait)
            .then(() => {
              expect(queue).to.deep.equal([barTask, bazTask]);
              expect(complete).to.deep.equal([fooTask]);
              expect(fooTask.result).to.equal('ok');
              expect(fooTask.runDependents.calledOnce).to.equal(true);
            })
            .then(done)
            .catch(done);
        });

        it('should empty the queue if transition is canceled', done => {

          transition.isSuperseded = () => true;
          transition._fail = () => Promise.reject();

          const queue = [fooTask, barTask, bazTask];
          const complete = [];
          const wait = 3;

          sinon.stub(fooTask, 'runDependents');
          fooResolve.execute = sinon.spy();

          return fooTask
            .runSelf(queue, complete, wait)
            .catch(() => {
              expect(queue).to.deep.equal([]);
              expect(complete).to.deep.equal([]);
              expect(fooResolve.execute.called).to.equal(false);
              expect(fooTask.runDependents.called).to.equal(false);
            })
            .then(done);
        });


        it('should not run itself if it is not in the queue', done => {

          transition.isSuperseded = () => true;
          transition._fail = () => Promise.reject();

          const queue = [];
          const complete = [];
          const wait = 3;

          sinon.stub(fooTask, 'runDependents');
          fooResolve.execute = sinon.spy();

          return fooTask
            .runSelf(queue, complete, wait)
            .then(() => {
              expect(fooResolve.execute.called).to.equal(false);
              expect(fooTask.runDependents.called).to.equal(false);
            })
            .then(done)
            .catch(done);
        });


        it('should not run dependents if completed', done => {

          transition.isSuperseded = () => false;
          const queue = [fooTask];
          const complete = [];
          const wait = 1;

          sinon.stub(fooTask, 'runDependents');
          fooResolve.execute = sinon.stub();

          return fooTask
            .runSelf(queue, complete, wait)
            .then(() => {
              expect(queue).to.deep.equal([]);
              expect(complete).to.deep.equal([fooTask]);
              expect(fooTask.runDependents.called).to.equal(false);
            })
            .then(done)
            .catch(done);
        });

      });

      describe('.runDependents(transition, queue, complete, wait)',() => {

        it('should run all dependents that are now ready', done => {

          transition.isSuperseded = () => false;
          const queue = [barTask, bazTask];
          const complete = [fooTask];
          const wait = 3;

          sinon.spy(barTask, 'setDependency');
          sinon.spy(bazTask, 'setDependency');

          barTask.runSelf = sinon.stub();
          bazTask.runSelf = sinon.stub();

          return fooTask
            .runDependents(queue, complete, wait)
            .then(() => {
              expect(barTask.setDependency.calledOnce).to.equal(true);
              expect(bazTask.setDependency.calledOnce).to.equal(true);
              expect(barTask.runSelf.calledOnce).to.equal(true);
              expect(bazTask.runSelf.calledOnce).to.equal(false);
            })
            .then(done)
            .catch(done);
        });
      });

    });

  });

});