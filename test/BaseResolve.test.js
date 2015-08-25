
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;

chai.use(sinonChai);
chai.use(chaiAsPromised);

var Promise = require('native-promise-only');
var State = require('../modules/State');
var BaseResolve = require('../modules/BaseResolve');

describe('BaseResolve', function () {

  var state, cache;

  beforeEach(function () {

    state = new State({
      name: 'foo',
      resolve: {
        fooResolve: sinon.spy()
      }
    });
    cache = { unset: sinon.spy() };
  });


  it('should have an id', function () {

    var resolve = new BaseResolve('fooResolve', state, Promise);

    expect(resolve.id).to.equal('fooResolve@foo');
  });


  it('should be cacheable by default', function () {

    var resolve = new BaseResolve('fooResolve', state, Promise);

    expect(resolve.cacheable).to.equal(true);
  });


  it('should not cacheable if state is not cacheable', function () {

    state.cacheable = false;

    var resolve = new BaseResolve('fooResolve', state, Promise);

    expect(resolve.cacheable).to.equal(false);
  });


  describe('.clear()', function () {

    it('should noop if not cacheable', function () {

      var resolve = new BaseResolve('fooResolve', state, Promise);

      resolve.cache = cache;
      resolve.cacheable = false;
      resolve.clear();

      expect(cache.unset.called).to.equal(false);
    });


    it('should clear its cached result', function () {

      var resolve = new BaseResolve('fooResolve', state, Promise);

      resolve.cache = cache;
      resolve.clear();

      expect(cache.unset).to.have.been.calledWithExactly('fooResolve@foo');
    });

  });


  describe('.createTask(params, query, cache)', function () {

    var params, query, transition, cache;

    beforeEach(function () {

      params = { baz: 42 };
      query = { qux: 'quux' };
      cache = { set: sinon.spy() };
      transition = {};
    });

    it('should reference the cache and create a task delegate', function () {

      var resolve = new BaseResolve('fooResolve', state, Promise);
      var task = resolve.createTask(params, query, transition, cache);

      expect(resolve.cache).to.equal(cache);
      expect(task).to.be.ok;
    });


    it('should copy a dependency list to the task', function () {

      var resolve = new BaseResolve('fooResolve', state, Promise);

      resolve.injectables = ['grault', 'garply'];

      var task = resolve.createTask(params, query, cache);

      expect(task.waitingFor).to.deep.equal(resolve.injectables);
      expect(task.waitingFor).not.to.equal(resolve.injectables);
    });


    describe('taskDelegate', function () {

      var fooResolve, barResolve, bazResolve;
      var fooTask, barTask, bazTask;
      var params, query, cache;
      var transition;

      beforeEach(function () {

        var state = new State({
          name: 'state',
          resolve: {
            foo: sinon.spy(),
            bar: ['foo', sinon.spy()],
            baz: ['foo', 'bar', sinon.spy()]
          }
        });

        fooResolve = new BaseResolve('foo', state, Promise);
        barResolve = new BaseResolve('bar', state, Promise);
        bazResolve = new BaseResolve('bar', state, Promise);

        barResolve.injectables = ['foo@state'];
        bazResolve.injectables = ['foo@state', 'bar@state'];

        params = { qux: 'quux' };
        query = { grault: 'garply' };
        transition = {};
        cache = { set: sinon.spy() };

        fooTask = fooResolve.createTask(params, query, transition, cache);
        barTask = barResolve.createTask(params, query, transition, cache);
        bazTask = bazResolve.createTask(params, query, transition, cache);
      });

      describe('.isReady()', function () {

        it('should whether it is ready', function () {

          expect(fooTask.isReady()).to.equal(true);
          expect(barTask.isReady()).to.equal(false);
          expect(bazTask.isReady()).to.equal(false);
        });
      });

      describe('.isWaitingFor(dependencyId)', function () {

        it('should know who it is waiting for', function () {

          expect(barTask.isWaitingFor('foo@state')).to.equal(true);
          expect(barTask.isWaitingFor('baz@state')).to.equal(false);
          expect(bazTask.isWaitingFor('foo@state')).to.equal(true);
          expect(bazTask.isWaitingFor('bar@state')).to.equal(true);
        });
      });


      describe('.setDependency(dependencyId, result)', function () {

        it('should store the dependency and stop waiting for it', function () {

          expect(barTask.waitingFor).to.deep.equal(['foo@state']);

          barTask.setDependency('foo@state', 42);

          expect(barTask.waitingFor).to.deep.equal([]);
          expect(barTask.dependencies['foo@state']).to.equal(42);

          expect(bazTask.waitingFor).to.deep.equal(['foo@state', 'bar@state']);

          bazTask.setDependency('foo@state', 42);

          expect(bazTask.waitingFor).to.deep.equal(['bar@state']);
          expect(bazTask.dependencies['foo@state']).to.equal(42);

          bazTask.setDependency('bar@state', 'corge');

          expect(bazTask.waitingFor).to.deep.equal([]);
          expect(bazTask.dependencies['bar@state']).to.equal('corge');
        });

      });


      describe('.perform()', function () {

        it('should call its resolve and return a promise', function () {

          fooResolve.execute = sinon.stub().returns('Yay!');

          var resolve = fooTask.perform();

          expect(fooResolve.execute)
            .to.have.been
            .calledWithExactly(params, query, transition, undefined);

          fooResolve.execute = sinon.stub().throws('Oops!');

          var reject = fooTask.perform();

          return Promise.all([
            expect(resolve).to.eventually.equal('Yay!'),
            expect(reject).to.eventually.be.rejectedWith('Oops!')
          ]);
        });

      });


      describe('.commit()', function () {

        it('should set its result on the cache', function () {

          fooTask.result = 'WHARGARBLE';

          fooTask.commit();

          expect(cache.set)
            .to.have.been.calledWithExactly('foo@state', 'WHARGARBLE');
        });

      });


      describe('.runSelf(transition, queue, complete, wait)', function () {

        it('should run itself and then run dependents', function (done) {

          transition.isSuperseded = function () { return false; };

          var queue = [fooTask, barTask, bazTask];
          var complete = [];
          var wait = 3;

          sinon.stub(fooTask, 'runDependents');
          fooResolve.execute = sinon.stub().returns('ok');

          return fooTask
            .runSelf(queue, complete, wait)
            .then(function () {
              expect(queue).to.deep.equal([barTask, bazTask]);
              expect(complete).to.deep.equal([fooTask]);
              expect(fooTask.result).to.equal('ok');
              expect(fooTask.runDependents.calledOnce).to.equal(true);
              return done();
            });
        });

        it('should empty the queue if transition is canceled', function (done) {

          transition.isSuperseded = function () { return true; };
          transition._fail = function () { return Promise.reject(); };

          var queue = [fooTask, barTask, bazTask];
          var complete = [];
          var wait = 3;

          sinon.stub(fooTask, 'runDependents');
          fooResolve.execute = sinon.spy();

          return fooTask
            .runSelf(queue, complete, wait)
            .catch(function () {
              expect(queue).to.deep.equal([]);
              expect(complete).to.deep.equal([]);
              expect(fooResolve.execute.called).to.equal(false);
              expect(fooTask.runDependents.called).to.equal(false);
              return done();
            });
        });


        it('should not run itself if it is not in the queue', function (done) {

          transition.isSuperseded = function () { return true; };
          transition._fail = function () { return Promise.reject(); };

          var queue = [];
          var complete = [];
          var wait = 3;

          sinon.stub(fooTask, 'runDependents');
          fooResolve.execute = sinon.spy();

          return fooTask
            .runSelf(queue, complete, wait)
            .then(function () {
              expect(fooResolve.execute.called).to.equal(false);
              expect(fooTask.runDependents.called).to.equal(false);
              return done();
            });
        });


        it('should not run dependents if completed', function (done) {

          transition.isSuperseded = function () { return false; };
          var queue = [fooTask];
          var complete = [];
          var wait = 1;

          sinon.stub(fooTask, 'runDependents');
          fooResolve.execute = sinon.stub();

          return fooTask
            .runSelf(queue, complete, wait)
            .then(function () {
              expect(queue).to.deep.equal([]);
              expect(complete).to.deep.equal([fooTask]);
              expect(fooTask.runDependents.called).to.equal(false);
              return done();
            });
        });

      });

      describe('.runDependents(transition, queue, complete, wait)',function () {

        it('should run all dependents that are now ready', function (done) {

          transition.isSuperseded = function () { return false; };

          var queue = [barTask, bazTask];
          var complete = [fooTask];
          var wait = 3;

          sinon.spy(barTask, 'setDependency');
          sinon.spy(bazTask, 'setDependency');

          barTask.runSelf = sinon.stub();
          bazTask.runSelf = sinon.stub();

          return fooTask
            .runDependents(queue, complete, wait)
            .then(function () {
              expect(barTask.setDependency.calledOnce).to.equal(true);
              expect(bazTask.setDependency.calledOnce).to.equal(true);
              expect(barTask.runSelf.calledOnce).to.equal(true);
              expect(bazTask.runSelf.calledOnce).to.equal(false);
              return done();
            });
        });
      });

    });

  });

});