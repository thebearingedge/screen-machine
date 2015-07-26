
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;

chai.use(sinonChai);
chai.use(chaiAsPromised);


var ResolveTask = require('../modules/ResolveTask');
var resolveCache = require('../modules/resolveCache');

describe('ResolveTask', function () {

  var resolve, params, cache, task;

  describe('SimpleResolve', function () {

    beforeEach(function () {

      resolve = {
        id: 'baz@qux',
        execute: sinon.spy()
      };
      params = { foo: 'bar' };
      cache = resolveCache({ stateless: true });
      task = new ResolveTask(resolve, params, cache, Promise);
    });


    describe('.commit() -> this', function () {

      it('should cache its result', function () {

        var result = 42;

        task.stash(result);

        expect(cache.$store['baz@qux']).to.equal(42);
      });

    });


    describe('.isReady() -> Boolean', function () {

      it('should be ready!', function () {

        expect(task.isReady()).to.equal(true);
      });

    });


    describe('.execute() -> Promise', function () {

      it('should return a promise for its resolve', function () {

        var promise = task.execute();

        expect(promise instanceof Promise).to.equal(true);
        expect(resolve.execute)
          .to.have.been.calledWithExactly({ foo: 'bar' }, undefined);
        expect(promise).to.eventually.be.fulfilled;
      });


      it('should reject an error from its resolve', function () {

        resolve.execute = sinon.spy(function () { throw new Error(); });

        var promise = task.execute();

        expect(promise instanceof Promise).to.equal(true);
        expect(resolve.execute)
          .to.have.been.calledWithExactly({ foo: 'bar' }, undefined);
        expect(promise).to.eventually.be.rejected;
      });

    });

  });


  describe('DependentResolve', function () {

    beforeEach(function () {

      resolve = {
        id: 'baz@qux',
        execute: sinon.spy(),
        injectables: ['a', 'b']
      };
      params = { foo: 'bar' };
      cache = resolveCache({ stateless: true });
      task = new ResolveTask(resolve, params, cache, Promise);
    });


    describe('.isWaitingFor(String dependency) -> Boolean', function () {

      it('should be waiting for "a"', function () {

        expect(task.isWaitingFor('a')).to.equal(true);
        expect(task.isWaitingFor('z')).to.equal(false);
      });

    });


    describe('.setDependency(String dependency, <Any> result)', function () {

      it('should no longer be waiting for "a"', function () {

        task.setDependency('a', 42);
        expect(task.isWaitingFor('a')).to.equal(false);
      });

    });


    describe('.execute() -> Promise', function () {

      it('should execute resolve with params and dependencies', function () {

        resolve.execute = sinon.stub();

        task.setDependency('a', 42);
        task.setDependency('b', 'baz');
        task.execute();

        expect(resolve.execute)
          .to.have.been.calledWithExactly({ foo: 'bar' }, { a: 42, b: 'baz' });
      });

    });

  });

});
