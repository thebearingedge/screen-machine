
'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Promise from 'native-promise-only';
import stateMachine from '../modules/stateMachine';
import State from '../modules/State';
import SimpleResolve from '../modules/SimpleResolve';
import DependentResolve from '../modules/DependentResolve';
import Transition from '../modules/Transition';

chai.use(sinonChai);

const { expect } = chai;

describe('Transition', () => {

  let transition, machine, toState, toParams, toQuery;

  beforeEach(() => {
    machine = stateMachine({}, Promise);
    toParams = {};
    toQuery = {};
    toState = {};
    transition = new Transition(machine, toState, toParams, toQuery);
    machine.transition = transition;
  });

  describe('.cancel()', () => {

    it('should cancel the current transition', () => {
      transition.cancel();
      expect(transition.isCanceled()).to.equal(true);
    });

    it('should not be cancelable if succeeded', () => {
      transition._succeeded = true;
      transition.cancel();
      expect(transition._canceled).to.equal(false);
    });

  });

  describe('.isCanceled()', () => {

    it('should not be initially canceled', () => {
      expect(transition.isCanceled()).to.equal(false);
    });

    it('should not be canceled if it already succeeded', () => {
      transition._succeeded = true;
      expect(transition.isCanceled()).to.equal(false);
    });

  });

  describe('.isSuccessful()', () => {

    it('should not be initially successful', () => {
      expect(transition.isSuccessful()).to.equal(false);
    });

    it('should be successful if succeeded and not superceded', () => {
      transition._succeeded = true;
      expect(transition.isSuccessful()).to.equal(true);
    });

  });

  describe('.redirect(state, params, query)', () => {

    it('should start a new machine transition with args', () => {
      sinon.stub(machine, 'transitionTo');
      transition.redirect('foo', { bar: 'baz' }, { qux: 'quux' });
      expect(machine.transitionTo)
        .to.have.been.calledWithExactly('foo', { bar: 'baz' }, { qux: 'quux' });
    });

  });

  describe('.retry()', () => {

    it('should start a new machine transition with current args', () => {
      sinon.stub(machine, 'transitionTo');
      transition.retry();
      expect(machine.transitionTo)
        .to.have.been.calledWithExactly(toState, toParams, toQuery);
    });

  });

  describe('._prepare(resolves, cache, exiting, Promise)', () => {

    let state, cache;
    let fooResolve, barResolve;

    beforeEach(() => {
      state = new State({
        name: 'state',
        resolve: {
          foo: () => {},
          bar: ['foo', () => {}]
        }
      });
      fooResolve = new SimpleResolve('foo', state, Promise);
      barResolve = new DependentResolve('bar', state, Promise);
      cache = machine.cache;
    });

    it('should pull missing dependencies from the cache', () => {
      const cacheSpy = sinon.spy(cache, 'get');
      transition._prepare([barResolve], cache, [], Promise);
      expect(cacheSpy).to.have.been.calledWithExactly('foo@state');
    });

    it('should NOT THROW if the task dependencies are ACYCLIC', () => {
      expect(transition._prepare([fooResolve, barResolve], cache))
        .to.not.throw;
    });

    it('should THROW if the task dependencies are CYCLIC', () => {
      fooResolve.injectables = ['bar@state'];
      const message = 'Cyclic resolve dependency: ' +
                    'foo@state -> bar@state -> foo@state';
      expect(
        transition._prepare.bind(transition, [fooResolve, barResolve], cache)
      ).to.throw(Error, message);
    });

  });

});
