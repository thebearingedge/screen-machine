
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var State = require('../modules/State');
var resolveService = require('../modules/resolveService');
var SimpleResolve = require('../modules/SimpleResolve');
var DependentResolve = require('../modules/DependentResolve');
var ResolveTask = require('../modules/ResolveTask');

describe('resolveService', function () {

  var service;

  beforeEach(function () {

    service = resolveService(Promise);
    service.stateless = true;
  });


  describe('.getCache() -> Object resolveCache', function () {

    it('should return a new resolveCache', function () {

      var cache1 = service.getCache();
      var cache2 = service.getCache();

      expect(cache1).not.to.equal(cache2);
    });


    it('should return the same resolveCache', function () {

      service.stateless = false;

      var cache1 = service.getCache();
      var cache2 = service.getCache();

      expect(cache1).to.equal(cache2);
    });

  });


  describe('.instantiate(resolveKey, state) -> resolve', function () {

    var state;

    beforeEach(function () {

      state = new State({ name: 'foo' });
    });


    it('should create a SimpleResolve', function () {

      state.resolve = {
        foo: function () {}
      };

      var resolve = service.instantiate('foo', state);

      expect(resolve instanceof SimpleResolve).to.equal(true);
    });


    it('should create a DependentResolve', function () {

      state.resolve = {
        bar: ['foo', function () {}]
      };

      var resolve = service.instantiate('bar', state);

      expect(resolve instanceof DependentResolve).to.equal(true);
    });

  });


  describe('.addResolvesTo(state) -> this', function () {

    var state;

    beforeEach(function () {

      state = new State({ name: 'foo' });
    });


    it('should not add resolves to a state with none defined', function () {

      var spy = sinon.spy(service, 'instantiate');

      service.addResolvesTo(state);

      expect(spy.called).to.equal(false);
      expect(state.$resolves).to.equal(null);
    });


    it('should add resolves to a state', function () {

      state.resolve = {
        bar: function () {},
        baz: ['bar', function () {}]
      };

      var spy = sinon.spy(service, 'instantiate');

      service.addResolvesTo(state);

      expect(spy.calledTwice).to.equal(true);
      expect(state.$resolves.length).to.equal(2);
    });

  });


  describe('.createTask(resolve, params, cache', function () {

    it('should create a task with filtered params', function () {

      var state = new State({
        name: 'foo',
        resolve: {
          fooResolve: function () {}
        }
      });

      state.$paramKeys = ['bar', 'baz'];

      var resolve = service.instantiate('fooResolve', state);
      var params = { bar: 1, baz: 2, qux: 3 };
      var cache = service.getCache();
      var task = service.createTask(resolve, params, cache);

      expect(task instanceof ResolveTask).to.equal(true);
      expect(task.params).to.deep.equal({ bar: 1, baz: 2 });
    });

  });


  describe('.prepareTasks(tasks, resolveCache)', function () {

    it('should pull missing dependencies from the resolveCache', function () {

      var cache = service.getCache();
      cache.set('bar', 42);

      var mockTask = {
        name: 'foo',
        waitingFor: ['bar'],
        dependencies: {},
        isReady: function () { return false; },
        setDependency: function (key, val) {
          this.dependencies[key] = val;
          this.waitingFor.splice(this.waitingFor.indexOf(key), 1);
        }
      };

      sinon.spy(cache, 'get');

      service.prepareTasks([mockTask], cache);

      expect(cache.get).to.have.been.calledWithExactly('bar');
      expect(mockTask.dependencies.bar).to.equal(42);
    });


    it('should NOT THROW if the task dependencies are ACYCLIC', function () {

      var cache = service.getCache();

      var fooTask = {
        name: 'foo',
        waitingFor: [],
        dependencies: {},
        isReady: function () { return true; },
      };
      var barTask = {
        name: 'bar',
        waitingFor: ['foo'],
        dependencies: {},
        isReady: function () { return false; }
      };

      expect(service.prepareTasks([fooTask, barTask], cache)).to.be.ok;
    });


    it('should THROW if the task dependencies are CYCLIC', function () {

      var cache = service.getCache();

      var fooTask = {
        name: 'foo',
        waitingFor: ['bar'],
        dependencies: {},
        isReady: function () { return false; },
      };
      var barTask = {
        name: 'bar',
        waitingFor: ['foo'],
        dependencies: {},
        isReady: function () { return false; }
      };

      expect(service.prepareTasks.bind(service, [fooTask, barTask], cache))
        .to.throw(Error, 'Cyclic resolve dependency: foo -> bar -> foo');
    });

  });


  describe('.runTasks(tasks, resolveCache, transition)', function () {

    var fooResolve, barResolve, bazResolve, quxResolve;
    var params, cache;
    var fooTask, barTask, bazTask, quxTask;
    var tasks, transition;

    beforeEach(function () {

      fooResolve = {
        id: 'foo',
        execute: sinon.spy(function (params) {
          // 18
          return Promise.resolve(3 * params.corge);
        })
      };

      barResolve = {
        id: 'bar',
        injectables: ['foo'],
        execute: sinon.spy(function (params, deps) {
          // 16
          return Promise.resolve((deps.foo / 2) + params.grault);
        })
      };

      bazResolve = {
        id: 'baz',
        injectables: ['foo', 'bar'],
        execute: sinon.spy(function (params, deps) {
          // 40
          return Promise.resolve(deps.foo + deps.bar + params.corge);
        })
      };

      quxResolve = {
        id: 'qux',
        execute: sinon.spy(function (params) {
          // 24
          return 3 * params.garpley;
        })
      };

      params = { corge: 6, grault: 7, garpley: 8 };

      cache = {};

      fooTask = new ResolveTask(fooResolve, params, cache, Promise);
      barTask = new ResolveTask(barResolve, params, cache, Promise);
      bazTask = new ResolveTask(bazResolve, params, cache, Promise);
      quxTask = new ResolveTask(quxResolve, params, cache, Promise);

      tasks = [fooTask, barTask, bazTask, quxTask];
      transition = {};
      sinon.stub(service, 'prepareTasks');
    });


    afterEach(function () {

      service.prepareTasks.restore();
    });


    it('should resolve an empty array if tasks is empty', function () {

      var run = service.runTasks([]);

      return expect(run).to.eventually.deep.equal([]);
    });


    it('should run tasks in dependency order', function (done) {

      transition.isSuperceded = function () { return false; };

      return service
        .runTasks(tasks, cache, transition)
        .then(function (complete) {

          var results = complete
            .reduce(function (results, task) {

              results[task.id] = task.result;

              return results;
            }, {});

          expect(fooResolve.execute.calledOnce).to.equal(true);
          expect(barResolve.execute.calledOnce).to.equal(true);
          expect(bazResolve.execute.calledOnce).to.equal(true);
          expect(quxResolve.execute.calledOnce).to.equal(true);
          expect(results).to.deep.equal({ foo: 18, bar: 16, baz: 40, qux: 24 });

          return done();
        });
    });

  });

});
