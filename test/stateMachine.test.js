
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var BaseComponent = require('../modules/BaseComponent');
var eventBus = require('../modules/EventBus');
var viewTree = require('../modules/viewTree');
var resolveService = require('../modules/resolveService');
var stateRegistry = require('../modules/stateRegistry');


var stateMachine = require('../modules/stateMachine');


describe('stateMachine', function () {

  var document;
  var views, resolves, registry, events, machine;


  beforeEach(function () {

    document = {};
    events = eventBus({
      emitter: { emit: function () {} },
      trigger: 'emit'
    });

    views = viewTree(document, BaseComponent);
    resolves = resolveService(Promise);
    registry = stateRegistry(views, resolves);
    machine = stateMachine(events, registry, resolves, views);
  });


  describe('.init(startState, startParams)', function () {

    it('should initialize', function () {

      var rootState = registry.$root;
      var startParams = {};

      machine.init(rootState, startParams);

      expect(machine.$state.current).to.equal(rootState);
      expect(machine.$state.params).to.equal(startParams);
    });

  });


  describe('.transitionTo(stateOrName, params, query, options)', function () {

    var rootState, appState, fooState, barState, bazState, quxState, quuxState;
    var initialParams, initialQuery;

    beforeEach(function () {

      rootState = registry.$root;
      initialParams = {};
      initialQuery = {};

      appState = registry
        .add('app', {
          path: '/'
        });

      fooState = registry
        .add('app.foo', {
          path: 'foo/:fooParam',
          resolve: {
            fooResolve: sinon.spy()
          }
        });

      barState = registry
        .add('app.foo.bar', {
          path: 'bar?barQuery',
          resolve: {
            barResolve: sinon.spy(function (params) {

              return params.fooParam;
            })
          }
        });

      bazState = registry
        .add('app.foo.bar.baz', {
          path: '/baz/:bazParam',
          resolve: {
            bazResolve: ['barResolve@app.foo.bar', sinon.spy()]
          }
        });

      quxState = registry
        .add('qux', {
          path: '/qux'
        });

      quuxState = registry
        .add('quux', {
          parent: 'qux',
          path: '/:quuxParam',
          resolve: {
            quuxResolve: sinon.spy()
          }
        });

    });


    it('should transition from "root" to "app"', function (done) {

      machine.init(rootState, initialParams, initialQuery);

      var params = {};
      var query = {};

      return machine
        .transitionTo(appState, params, query)
        .then(function () {

          expect(machine.$state.current).to.equal(appState);
          expect(machine.$state.params).to.equal(params);
          expect(machine.$state.query).to.equal(query);
          return done();
        });
    });


    it('should transition from "root" to "app" by name', function (done) {

      machine.init(rootState, initialParams, initialQuery);

      var params = {};
      var query = {};

      return machine
        .transitionTo('app', params, query)
        .then(function () {

          expect(machine.$state.current).to.equal(appState);
          expect(machine.$state.params).to.equal(params);
          expect(machine.$state.query).to.equal(query);
          return done();
        });
    });


    it('should rethrow any unhandeled resolve error', function () {

      machine.init(rootState, initialParams, initialQuery);

      sinon
        .stub(registry.states['app.foo'].$resolves[0], 'execute')
        .throws(new Error('oops!'));

      var params = { fooParam: 'foo' };
      var query = {};

      return Promise
        .resolve(
          expect(machine.transitionTo('app.foo', params, query))
            .to.eventually.be.rejectedWith(Error, 'oops!')
        );
    });


    it('should not rethrow a handled resolve error', function () {

      machine.init(rootState, initialParams, initialQuery);

      events.notify = function (eventName, transition) {

        if (eventName === 'stateChangeError') {

          transition.errorHandled();
        }
      };

      sinon
        .stub(registry.states['app.foo'].$resolves[0], 'execute')
        .throws(new Error('oops!'));

      var params = { fooParam: 'foo' };
      var query = {};

      return Promise
        .resolve(
          expect(machine.transitionTo('app.foo', params, query))
            .to.eventually.be.fulfilled
        );
    });


    it('should transition from "root" to "foo"', function (done) {

      machine.init(rootState, initialParams, initialQuery);

      var params = { fooParam: '42' };
      var query = {};

      return machine
        .transitionTo(fooState, params, query)
        .then(function () {

          expect(fooState.resolve.fooResolve)
            .to.have.been.calledWithExactly({ fooParam: '42' }, query);
          expect(machine.$state.current).to.equal(fooState);
          expect(machine.$state.params).to.equal(params);
          expect(machine.$state.query).to.equal(query);
          return done();
        });
    });


    it('should transition from "foo" to "bar"', function (done) {

      machine.init(fooState, { fooParam: '42' }, {});

      var params = { fooParam: '42' };
      var query = { barquery: '7' };

      return machine
        .transitionTo(barState, params, query)
        .then(function () {

          expect(fooState.resolve.fooResolve.called).to.equal(false);
          expect(barState.resolve.barResolve)
            .to.have.been.calledWithExactly(params, query);
          expect(machine.$state.current).to.equal(barState);
          expect(machine.$state.params).to.equal(params);
          expect(machine.$state.query).to.equal(query);
          return done();
        });
    });


    it('should transition from "foo" to "baz"', function (done) {

      machine.init(fooState, { fooParam: '42' });

      var params = { fooParam: '42', bazParam: '50' };
      var query = { barQuery: '7' };

      return machine
        .transitionTo(bazState, params, query)
        .then(function () {

          expect(fooState.resolve.fooResolve.called).to.equal(false);
          expect(barState.resolve.barResolve)
            .to.have.been
            .calledWithExactly({ fooParam: '42' }, { barQuery: '7' });
          expect(bazState.resolve.bazResolve[1])
            .to.have.been
            .calledWithExactly(
              '42', { fooParam: '42', bazParam: '50' }, { barQuery: '7' }
            );
          expect(machine.$state.current).to.equal(bazState);
          expect(machine.$state.params).to.equal(params);
          expect(machine.$state.query).to.equal(query);
          return done();
        });
    });


    it('should transition from "baz" to "quux"', function (done) {

      machine.init(
        bazState, { fooParam: '42', bazParam: '24' }, { barQuery: '7' }
      );

      var params = { quuxParam: 'fin' };
      var query = {};

      return machine
        .transitionTo(quuxState, params, query)
        .then(function () {

          expect(fooState.resolve.fooResolve.called).to.equal(false);
          expect(quuxState.resolve.quuxResolve)
            .to.have.been.calledWithExactly({ quuxParam: 'fin' }, query);
          expect(machine.$state.current).to.equal(quuxState);
          expect(machine.$state.params).to.equal(params);
          expect(machine.$state.query).to.equal(query);
          return done();
        });
    });


    it('should not run resolves if immediately canceled', function (done) {

      sinon.spy(resolves, 'runTasks');

      events.notify = function (event, transition) {

        transition.cancel();
      };

      machine.init(rootState, {}, {});

      return machine
        .transitionTo(fooState, { fooParam: '42' }, { barQuery: '7' })
        .then(function () {

          expect(resolves.runTasks.called).to.equal(false);
          expect(machine.$state.current).to.equal(rootState);
          expect(machine.$state.params).to.deep.equal({});
          expect(machine.$state.query).to.deep.equal({});
          return done();
        });
    });


    it('should not compose views if transition is canceled', function (done) {

      machine.init(rootState, {}, {});

      sinon.spy(views, 'compose');

      var transitionPromise = machine
        .transitionTo(fooState, { fooParam: '42' }, {});

      machine.$state.transition.cancel();

      return transitionPromise
        .then(function () {

          expect(views.compose.called).to.equal(false);
          expect(machine.$state.current).to.equal(rootState);
          expect(machine.$state.params).to.deep.equal({});
          expect(machine.$state.query).to.deep.equal({});
          return done();
        });
    });

  });

});