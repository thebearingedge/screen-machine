
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var DependentResolve = require('../modules/DependentResolve');
var State = require('../modules/State');

describe('DependentResolve', function () {

  var resolve, state;

  beforeEach(function () {

    state = new State({
      name: 'bar',
      resolve: {
        foo: ['baz@qux', sinon.spy(function () {})]
      }
    });

    resolve = new DependentResolve('foo', state);
  });


  it('should have an id', function () {

    expect(resolve.id).to.equal('foo@bar');
  });


  it('should ensure dependency ids', function () {

    state.resolve.foo[0] = 'baz';

    resolve = new DependentResolve('foo', state);

    expect(resolve.injectables[0]).to.equal('baz@bar');
  });


  describe('.execute(params, query, dependencies)', function () {

    it('should call its invokable with dependencies and params', function () {

      var params = { foo: 'bar' };
      var query = { grault: 'garpley' };
      var dependencies = { 'baz@qux': 42 };

      resolve.execute(params, query, dependencies);

      expect(state.resolve.foo[1])
        .to.have.been.calledWithExactly(42, params, query);
    });

  });

});
