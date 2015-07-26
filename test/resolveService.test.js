
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
var ResolveJob = require('../modules/ResolveJob');

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


  describe('.createJob(tasks, resolveCache, transition)', function () {

    it('should combine resolveTasks into a job', function () {

      sinon.stub(service, 'prepareTasks');

      var tasks = [{}, {}, {}];
      var transition = {};
      var job = service.createJob(tasks, transition);

      expect(job instanceof ResolveJob).to.equal(true);
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


    it('should NOT throw if the task dependencies are ACYCLIC', function () {

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

});