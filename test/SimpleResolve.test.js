
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);


var SimpleResolve = require('../modules/SimpleResolve');
var State = require('../modules/State');
var resolveCache = require('../modules/resolveCache');

describe('SimpleResolve', function () {

  var resolve, state, cache;

  beforeEach(function () {

    cache = resolveCache({ stateless: true });

    state = new State({
      name: 'bar',
      resolve: {
        foo: sinon.spy()
      }
    });

    resolve = new SimpleResolve('foo', state, cache);
  });


  it('should have an id', function () {

    expect(resolve.id).to.equal('foo@bar');
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


  describe('.execute(Object params) => <Any>', function () {

    it('should call its state\'s resolve function with params', function () {

      var params = { foo: 'bar' };

      resolve.execute(params);

      expect(state.resolve.foo).to.have.been.calledWithExactly(params);
    });

  });

});
