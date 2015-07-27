
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);


var ResolveJob = require('../modules/ResolveJob');
var ResolveTask = require('../modules/ResolveTask');

describe('ResolveJob', function () {

  var fooResolve, barResolve, bazResolve, quxResolve;
  var params, cache;
  var fooTask, barTask, bazTask, quxTask;
  var tasks, job, transition;

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

    job = new ResolveJob(tasks, transition, Promise);
  });


  it('should run tasks in dependency order', function (done) {

    transition.isSuperceded = function () { return false; };

    return job
      .run()
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

  it('should not run tasks during a superceded transition', function (done) {

    transition.isSuperceded = function () { return true; };

    return job
      .run()
      .then(function (complete) {

        expect(complete.length).to.equal(0);
        expect(fooResolve.execute.called).to.equal(false);
        expect(barResolve.execute.called).to.equal(false);
        expect(bazResolve.execute.called).to.equal(false);
        expect(quxResolve.execute.called).to.equal(false);
        return done();
      });

  });

});