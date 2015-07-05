'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var SimpleResolve = require('../SimpleResolve');


describe('SimpleResolve', function () {

  var resolveName, resolveFunc, stateParams, stateNode;
  var resolve;

  beforeEach(function () {

    resolveName = 'foo@bar';
    resolveFunc = sinon.spy();
    stateParams = { foo: 'bar' };
    stateNode = {
      name: 'bar',
      resolve: {
        'foo@bar': resolveFunc
      }
    };

    resolve = new SimpleResolve(resolveName, stateParams, stateNode);
  });


  it('should have instance properties', function () {

    expect(resolve.name).to.equal('foo@bar');
    expect(resolve.stateParams).to.equal(stateParams);
    expect(resolve.stateNode).to.equal(stateNode);
    expect(resolve._invokable).to.equal(resolveFunc);
  });


  describe('.isReady()', function () {

    it('was born ready', function () {

      expect(resolve.isReady()).to.equal(true);
    });

  });


  describe('.execute()', function () {

    it('should call invokable with params', function () {

      resolve.execute();

      expect(resolve._invokable)
        .to.have.been.calledWithExactly(stateParams);
    });

  });

});