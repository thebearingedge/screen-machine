
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;

var Promise = require('native-promise-only');
var State = require('../modules/State');
var SimpleResolve = require('../modules/SimpleResolve');
var DependentResolve = require('../modules/DependentResolve');
var resolveFactory = require('../modules/resolveFactory');


describe('resolveFactory', function () {

  var parentState, childState, grandChildState, factory;

  beforeEach(function () {

    factory = resolveFactory(Promise);
    parentState = new State({
      name: 'parent',
      resolve: {
        foo: function () {}
      }
    });
    childState = new State({
      name: 'parent.child',
      resolve: {
        bar: ['foo@parent', function () {}]
      }
    });
    grandChildState = new State({
      name: 'parent.child.grandChild'
    });
  });


  describe('.addTo(state)', function () {

    it('should create SimpleResolves', function () {

      factory.addTo(parentState);

      var resolve = parentState.$resolves[0];

      expect(resolve instanceof SimpleResolve).to.equal(true);
    });


    it('should create DependentResolves', function () {

      factory.addTo(childState);

      var resolve = childState.$resolves[0];

      expect(resolve instanceof DependentResolve).to.equal(true);
    });


    it('should noop if a state does not define resolves', function () {

      sinon.spy(factory, 'instantiate');

      factory.addTo(grandChildState);

      expect(factory.instantiate.called).to.equal(false);
    });

  });

});