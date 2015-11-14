
'use strict';

import chai from 'chai';
import sinon from 'sinon';
import Promise from 'native-promise-only';
import State from '../modules/State';
import SimpleResolve from '../modules/SimpleResolve';
import DependentResolve from '../modules/DependentResolve';
import resolveFactory from '../modules/resolveFactory';

const { expect } = chai;

describe('resolveFactory', () => {

  let parentState, childState, grandChildState, factory;

  beforeEach(() => {
    factory = resolveFactory(Promise);
    parentState = new State({
      name: 'parent',
      resolve: {
        foo: () => {}
      }
    });
    childState = new State({
      name: 'parent.child',
      resolve: {
        bar: ['foo@parent', () => {}]
      }
    });
    grandChildState = new State({
      name: 'parent.child.grandChild'
    });
  });

  describe('.addTo(state)', () => {

    it('should create SimpleResolves', () => {
      factory.addTo(parentState);
      const [ resolve ] = parentState.$resolves;
      expect(resolve instanceof SimpleResolve).to.equal(true);
    });


    it('should create DependentResolves', () => {
      factory.addTo(childState);
      const [ resolve ] = childState.$resolves;
      expect(resolve instanceof DependentResolve).to.equal(true);
    });


    it('should noop if a state does not define resolves', () => {
      sinon.spy(factory, 'instantiate');
      factory.addTo(grandChildState);
      expect(factory.instantiate.called).to.equal(false);
    });

  });

});