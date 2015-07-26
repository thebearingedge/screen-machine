
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var State = require('../modules/State');
var resolveService = require('../modules/resolveService');
var SimpleResolve = require('../modules/SimpleResolve');
var DependentResolve = require('../modules/DependentResolve');

describe('resolveService', function () {

  var service;


  beforeEach(function () {

    service = resolveService(Promise);
  });


  describe('.getCache() -> Object resolveCache', function () {

    it('should return the same resolveCache', function () {

      var cache1 = service.getCache();
      var cache2 = service.getCache();

      expect(cache1).to.equal(cache2);
    });

    it('should return a new resolveCache', function () {

      service.stateless = true;

      var cache1 = service.getCache();
      var cache2 = service.getCache();

      expect(cache1).not.to.equal(cache2);
    });

  });


  describe('.instantiate(resolveKey, state) -> resolve', function () {

    var state;

    beforeEach(function () {

      state = new State({ name: 'foo' });
    });

    it('should create a SimpleResolve', function () {

      state.resolve = {
        foo: function () {}
      };

      var resolve = service.instantiate('foo', state);

      expect(resolve instanceof SimpleResolve).to.equal(true);
    });


    it('should create a DependentResolve', function () {

      state.resolve = {
        bar: ['foo', function () {}]
      };

      var resolve = service.instantiate('bar', state);

      expect(resolve instanceof DependentResolve).to.equal(true);
    });

  });


  describe('.processState(state) -> this', function () {

    var state;

    beforeEach(function () {

      state = new State({ name: 'foo' });
    });


    it('should not add resolves to a state with none defined', function () {

      var spy = sinon.spy(service, 'instantiate');

      service.processState(state);

      expect(spy.called).to.equal(false);
      expect(state.$resolves).to.equal(null);

    });

    it('should add resolves to a state', function () {

      state.resolve = {
        bar: function () {},
        baz: ['bar', function () {}]
      };

      var spy = sinon.spy(service, 'instantiate');

      service.processState(state);

      expect(spy.calledTwice).to.equal(true);
      expect(state.$resolves.length).to.equal(2);
    });

  });


});