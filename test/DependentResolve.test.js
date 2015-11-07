
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var Promise = require('native-promise-only');
var State = require('../modules/State');
import DependentResolve from '../modules/DependentResolve';


describe('bDependentResolve', function () {

  var state;

  beforeEach(function () {

    state = new State({
      name: 'child',
      resolve: {
        bar: function () {},
        baz: ['foo@parent', 'bar', sinon.spy()]
      }
    });
  });


  it('should have an invokable and list of injectables', function () {

    var resolve = new DependentResolve('baz', state, Promise);

    expect(resolve.injectables).to.deep.equal(['foo@parent', 'bar@child']);
    expect(typeof resolve.invokable).to.equal('function');
    expect(resolve.invokable).to.equal(state.resolve.baz[2]);
  });


  it('should call its invokable with dependencies', function () {

    var params = {};
    var query = {};
    var transition = {};
    var dependencies = { 'foo@parent': 'krünk', 'bar@child': 'pöpli' };

    var resolve = new DependentResolve('baz', state, Promise);

    resolve.execute(params, query, transition, dependencies);

    expect(resolve.invokable)
      .to.have.been
      .calledWithExactly('krünk', 'pöpli', params, query, transition);
  });

});