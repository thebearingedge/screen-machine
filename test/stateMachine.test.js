
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
var router = require('../modules/router');


var stateMachine = require('../modules/stateMachine');


describe('stateMachine', function () {

  var window, document;
  var routerOptions, views, resolves, routes, registry, events, machine;


  beforeEach(function () {

    window = {
      history: {
        replaceState: function () {},
        pushState: function () {}
      },
      location: {
        replace: function () {}
      },
      addEventListener: function () {},
      removeEventListener: function () {}
    };
    document = {};
    routerOptions = {};
    events = eventBus({
      emitter: { emit: function () {} },
      trigger: 'emit'
    });

    views = viewTree(document, BaseComponent);
    resolves = resolveService(Promise);
    routes = router(window, routerOptions);
    registry = stateRegistry(views, resolves, routes);
    machine = stateMachine(events, registry, resolves, routes, views);
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


  describe('.start()', function () {

    it('should bootstrap the machine', function () {

      sinon.stub(machine, 'transitionTo');
      sinon.stub(views.views['@'], 'attachWithin');
      sinon.stub(routes, 'getUrl');
      sinon.stub(routes, 'findRoute')
        .returns(['app', {}]);

      machine.start();

      expect(machine.transitionTo)
        .to.have.been.calledWithExactly('app', {}, { routeChange: true });
    });
  });


  describe('.transitionTo(toState, toParams)', function () {

    var rootState, appState, fooState, barState, bazState, quxState, quuxState;
    var initialParams;

    beforeEach(function () {

      rootState = registry.$root;
      initialParams = {};

      machine
        .state('app', {
          path: '/'
        })
        .state('app.foo', {
          path: '/foo/:fooParam',
          resolve: {
            fooResolve: sinon.spy()
          }
        })
        .state('app.foo.bar', {
          path: '/bar?barParam',
          resolve: {
            barResolve: sinon.spy(function (params) {

              return params.fooParam;
            })
          }
        })
        .state('app.foo.bar.baz', {
          path: '/baz/:bazParam',
          resolve: {
            bazResolve: ['barResolve@app.foo.bar', sinon.spy()]
          }
        })
        .state('qux', {
          path: '/qux'
        })
        .state('quux', {
          parent: 'qux',
          path: '/:quuxParam',
          resolve: {
            quuxResolve: sinon.spy()
          }
        });

      appState = registry.states.app;
      fooState = registry.states['app.foo'];
      barState = registry.states['app.foo.bar'];
      bazState = registry.states['app.foo.bar.baz'];
      quxState = registry.states.qux;
      quuxState = registry.states.quux;
    });


    it('should transition from "root" to "app"', function (done) {

      machine.init(rootState, initialParams);

      var toParams = {};

      return machine
        .transitionTo(appState, toParams)
        .then(function () {

          expect(machine.$state.current).to.equal(appState);
          expect(machine.$state.params).to.equal(toParams);
          return done();
        });
    });


    it('should transition from "root" to "app" by name', function (done) {

      machine.init(rootState, initialParams);

      var toParams = {};

      return machine
        .transitionTo('app', toParams)
        .then(function () {

          expect(machine.$state.current).to.equal(appState);
          expect(machine.$state.params).to.equal(toParams);
          return done();
        });
    });


    it('should not update router after route change', function (done) {

      machine.init(rootState, initialParams);

      var toParams = {};
      sinon.spy(routes, 'update');

      return machine
        .transitionTo('app', toParams, { routeChange: true })
        .then(function () {

          expect(routes.update.called).to.equal(false);
          return done();
        });
    });


    it('should rethrow any unhandeled resolve error', function () {

      machine.init(rootState, initialParams);

      sinon
        .stub(registry.states['app.foo'].$resolves[0], 'execute')
        .throws(new Error('oops!'));

      var toParams = { fooParam: 'foo' };

      return Promise
        .resolve(
          expect(machine.transitionTo('app.foo', toParams))
            .to.eventually.be.rejectedWith(Error, 'oops!')
        );
    });


    it('should not rethrow a handled resolve error', function () {

      machine.init(rootState, initialParams);

      events.notify = function (eventName, transition) {

        if (eventName === 'stateChangeError') {

          transition.errorHandled();
        }
      };

      sinon
        .stub(registry.states['app.foo'].$resolves[0], 'execute')
        .throws(new Error('oops!'));

      var toParams = { fooParam: 'foo' };

      return Promise
        .resolve(
          expect(machine.transitionTo('app.foo', toParams))
            .to.eventually.be.fulfilled
        );
    });


    it('should transition from "root" to "foo"', function (done) {

      machine.init(rootState, initialParams);

      var toParams = { fooParam: '42' };

      return machine
        .transitionTo(fooState, toParams)
        .then(function () {

          expect(fooState.resolve.fooResolve)
            .to.have.been.calledWithExactly({ fooParam: '42' });
          expect(machine.$state.current).to.equal(fooState);
          expect(machine.$state.params).to.equal(toParams);
          return done();
        });
    });


    it('should transition from "foo" to "bar"', function (done) {

      machine.init(fooState, { fooParam: '42' });

      var toParams = { fooParam: '42', barParam: '7' };

      return machine
        .transitionTo(barState, toParams)
        .then(function () {

          expect(fooState.resolve.fooResolve.called).to.equal(false);
          expect(barState.resolve.barResolve)
            .to.have.been.calledWithExactly(toParams);
          expect(machine.$state.current).to.equal(barState);
          expect(machine.$state.params).to.equal(toParams);
          return done();
        });
    });


    it('should transition from "foo" to "baz"', function (done) {

      machine.init(fooState, { fooParam: '42' });

      var toParams = { fooParam: '42', barParam: '7', bazParam: '50' };

      return machine
        .transitionTo(bazState, toParams)
        .then(function () {

          expect(fooState.resolve.fooResolve.called).to.equal(false);
          expect(barState.resolve.barResolve)
            .to.have.been
            .calledWithExactly({ fooParam: '42', barParam: '7' });
          expect(bazState.resolve.bazResolve[1])
            .to.have.been
            .calledWithExactly('42', { fooParam: '42', bazParam: '50' });
          expect(machine.$state.current).to.equal(bazState);
          expect(machine.$state.params).to.equal(toParams);
          return done();
        });
    });


    it('should transition from "baz" to "quux"', function (done) {

      machine.init(bazState, { fooParam: '42', bazParam: '24' });

      var toParams = { quuxParam: 'fin' };

      return machine
        .transitionTo(quuxState, toParams)
        .then(function () {

          expect(fooState.resolve.fooResolve.called).to.equal(false);
          expect(quuxState.resolve.quuxResolve)
            .to.have.been.calledWithExactly({ quuxParam: 'fin' });
          expect(machine.$state.current).to.equal(quuxState);
          expect(machine.$state.params).to.equal(toParams);
          return done();
        });
    });


    it('should not run resolves if immediately canceled', function (done) {

      sinon.spy(resolves, 'runTasks');

      events.notify = function (event, transition) {

        transition.cancel();
      };

      machine.init(rootState, {});

      return machine
        .transitionTo(fooState, { fooParam: '42' })
        .then(function () {

          expect(resolves.runTasks.called).to.equal(false);
          expect(machine.$state.current).to.equal(rootState);
          expect(machine.$state.params).to.deep.equal({});
          return done();
        });
    });


    it('should not compose views if transition is canceled', function (done) {

      machine.init(rootState, {});

      sinon.spy(views, 'compose');

      var transitionPromise = machine
        .transitionTo(fooState, { fooParam: '42' });

      machine.$state.transition.cancel();

      return transitionPromise
        .then(function () {

          expect(views.compose.called).to.equal(false);
          expect(machine.$state.current).to.equal(rootState);
          expect(machine.$state.params).to.deep.equal({});
          return done();
        });
    });

  });

});