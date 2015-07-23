
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var xtend = require('xtend');
var DependentResolve = require('../modules/DependentResolve');
var State = require('../modules/State');
var resolveCache = require('../modules/resolveCache');

describe('DependentResolve', function () {

  var resolve, state, cache;

  beforeEach(function () {

    cache = xtend(resolveCache);
    cache.$store = {};

    state = new State({
      name: 'bar',
      resolve: {
        foo: ['baz@qux', sinon.spy(function () {})]
      }
    });

    resolve = new DependentResolve('foo', state, cache);
  });


  it('should have an id', function () {

    expect(resolve.id).to.equal('foo@bar');
  });


  it('should ensure dependency ids', function () {

    state.resolve.foo[0] = 'baz';

    resolve = new DependentResolve('foo', state, cache);

    expect(resolve.injectables[0]).to.equal('baz@bar');
  });


  describe('.getResult() => <Any>', function () {

    it('should retrieve its result from cache', function () {

      cache.$store['foo@bar'] = 42;

      expect(resolve.getResult()).to.equal(42);
    });

  });


  describe('.clearCache() => this', function () {

    it('should clear its result from cache', function () {

      var unset = sinon.spy(cache, 'unset');

      resolve.clearCache();

      expect(unset).to.have.been.calledWithExactly('foo@bar');
    });

  });


  describe('.execute(Object params, Object dependencies) => <Any>', function () {

    it('should call its invokable with dependencies and params', function () {

      var params = { foo: 'bar' };
      var dependencies = { 'baz@qux': 42 };

      resolve.execute(params, dependencies);

      expect(state.resolve.foo[1]).to.have.been.calledWithExactly(42, params);
    });

  });

});
