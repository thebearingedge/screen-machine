'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var DependentResolve = require('../DependentResolve');


describe('DependentResolve', function () {

  var resolveName, resolveFunc, stateParams, stateNode;
  var resolve;

  beforeEach(function () {

    resolveName = 'foo@bar';
    resolveFunc = [
      'baz@qux', sinon.spy(function () { return true; })
    ];
    stateParams = { foo: 'bar' };
    stateNode = {
      name: 'bar',
      resolve: {
        'foo@bar': resolveFunc
      }
    };

    resolve = new DependentResolve(resolveName, stateParams, stateNode);
  });


  it('should have instance properties', function () {

    expect(resolve.name).to.equal('foo@bar');
    expect(resolve.stateParams).to.equal(stateParams);
    expect(resolve.stateNode).to.equal(stateNode);
    expect(resolve._invokable).to.equal(resolveFunc[1]);
  });


  describe('.isReady()', function () {

    it('should return whether dependencies are met', function () {

      expect(resolve.isReady()).to.equal(false);

      resolve._dependencies = {
        'baz@qux': 42
      };

      expect(resolve.isReady()).to.equal(true);
    });

  });


  describe('.execute()', function () {

    it('should call invokable with dependencies and params', function () {

      resolve._dependencies = {
        'baz@qux': 42
      };

      var result = resolve.execute();

      expect(resolve._invokable)
        .to.have.been.calledWithExactly(42, stateParams);
      expect(result).to.equal(true);
    });

  });


  describe('.dependsOn(resolveName)', function () {

    it('should return whether the resolveName is a dependency', function () {

      expect(resolve.dependsOn('baz@qux')).to.equal(true);
    });

  });


  describe('.setDependency(name, value)', function () {

    it('should set the dependency and return the resolve', function () {

      var chained = resolve.setDependency('baz@qux', 42);

      expect(chained).to.equal(resolve);
      expect(chained._dependencies['baz@qux']).to.equal(42);
    });

  });

});