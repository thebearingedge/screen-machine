
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var Promise = require('native-promise-only');
import State from '../modules/State';
import SimpleResolve from '../modules/SimpleResolve';


describe('bSimpleResolve', function () {

  var state;

  beforeEach(function () {

    state = new State({
      name: 'child',
      resolve: {
        bar: sinon.spy(),
      }
    });
  });


  it('should have an invokable', function () {

    var resolve = new SimpleResolve('bar', state, Promise);

    expect(typeof resolve.invokable).to.equal('function');
    expect(resolve.invokable).to.equal(state.resolve.bar);
  });


  it('should call its invokable with arguments', function () {

    var params = {};
    var query = {};
    var transition = {};

    var resolve = new SimpleResolve('bar', state, Promise);

    resolve.execute(params, query, transition);

    expect(resolve.invokable)
      .to.have.been
      .calledWithExactly(params, query, transition);
  });

});