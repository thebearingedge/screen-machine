
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);


var SimpleResolve = require('../modules/SimpleResolve');
var State = require('../modules/State');

describe('SimpleResolve', function () {

  var resolve, state;

  beforeEach(function () {

    state = new State({
      name: 'bar',
      resolve: {
        foo: sinon.spy()
      }
    });

    resolve = new SimpleResolve('foo', state);
  });


  it('should have an id', function () {

    expect(resolve.id).to.equal('foo@bar');
  });


  describe('.execute(Object params) => <Any>', function () {

    it('should call its state\'s resolve function with params', function () {

      var params = { foo: 'bar' };

      resolve.execute(params);

      expect(state.resolve.foo).to.have.been.calledWithExactly(params);
    });

  });

});
