
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

        task.result = 42;

        task.commit();

        expect(cache.$store['baz@qux']).to.equal(42);
      });

    });


    describe('.isReady() -> Boolean', function () {

      it('should be ready!', function () {

        expect(task.isReady()).to.equal(true);
      });

    });


    describe('.run() -> Promise', function () {

      it('should return a promise for its resolve', function () {

        var transition = { isSuperceded: function () { return false; } };
        var promise = task.run(transition, [task], [], 1);

        expect(promise instanceof Promise).to.equal(true);
        expect(resolve.execute)
          .to.have.been.calledWithExactly({ foo: 'bar' }, undefined);
      });


      it('should reject an error from its resolve', function () {

        resolve.execute = sinon.spy(function () { throw new Error(); });

        var transition = { isSuperceded: function () { return false; } };
        var promise = task.run(transition, [task], [], 1);

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

      it('should execute resolve with params and deps', function (done) {

        var transition = { isSuperceded: function () { return false; } };

        resolve.execute = sinon.stub();

        task.setDependency('a', 42);
        task.setDependency('b', 'baz');
        return task.run(transition, [task], [], 1)
          .then(function () {

            expect(resolve.execute).to.have.been
              .calledWithExactly({ foo: 'bar' }, { a: 42, b: 'baz' });
            return done();
          });
      });

    });

  });


  describe('Resolving Dependents', function () {

    var fooResolve, barResolve, graultResolve;
    var params, cache;
    var fooTask, barTask, graultTask;
    var transition, queue, wait, complete;

    beforeEach(function () {

      fooResolve = {
        id: 'foo',
        execute: sinon.spy(function (params) {
          // 12
          return Promise.resolve(3 * params.baz);
        })
      };
      barResolve = {
        id: 'bar',
        injectables: ['foo'],
        execute: sinon.spy(function (params, deps) {
          // 11
          return Promise.resolve((deps.foo / 2) + params.qux);
        })
      };
      graultResolve = {
        id: 'grault',
        injectables: ['foo', 'bar'],
        execute: sinon.spy(function (params, deps) {
          // 27
          return deps.foo + deps.bar + params.baz;
        })
      };

      params = { baz: 4, qux: 5 };
      cache = {};

      fooTask = new ResolveTask(fooResolve, params, cache, Promise);
      barTask = new ResolveTask(barResolve, params, cache, Promise);
      graultTask = new ResolveTask(graultResolve, params, cache, Promise);

      transition = {};
      queue = [fooTask, barTask, graultTask];
      complete = [];
      wait = 3;

    });

    it('should run its dependents', function (done) {

      transition.isSuperceded = sinon.stub().returns(false);

      return fooTask
        .run(transition, queue, complete, wait)
        .then(function () {

          expect(fooTask.result).to.equal(12);
          expect(barTask.result).to.equal(11);
          expect(graultTask.result).to.equal(27);
          expect(complete).to.deep.equal([fooTask, barTask, graultTask]);

          return done();
        });
    });


    it('should not run dependent tasks after an error', function (done) {

      var resolveError = new Error('FAIL');
      transition.isSuperceded = function () { return false; };
      fooResolve.execute = sinon.spy(function () { throw resolveError; });

      return fooTask
        .run(transition, queue, complete, wait)
        .catch(function (err) {

          expect(err.message).to.equal('FAIL');
          expect(fooResolve.execute.called).to.equal(true);
          expect(barResolve.execute.called).to.equal(false);
          expect(graultResolve.execute.called).to.equal(false);

          return done();
        });
    });


    it('should not run during a superceded transition', function (done) {

      transition.isSuperceded = function () { return true; };

      return fooTask
        .run(transition, queue, complete, wait)
        .then(function () {

          expect(complete.length).to.equal(0);
          expect(fooResolve.execute.called).to.equal(false);
          expect(barResolve.execute.called).to.equal(false);
          expect(graultResolve.execute.called).to.equal(false);

          return done();
        });
    });

  });

});
