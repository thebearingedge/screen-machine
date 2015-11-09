
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

import Promise from 'native-promise-only';
import eventBus from '../modules/EventBus';
import resolveFactory from '../modules/resolveFactory';
import stateRegistry from '../modules/stateRegistry';
import stateMachine from '../modules/stateMachine';

describe('stateMachine', function () {

  var resolves, registry, events, machine;
  var rootState, appState, fooState, barState, bazState, quxState, quuxState;
  var initialParams, initialQuery;

  beforeEach(function () {

    events = eventBus({
      emitter: { emit: function () {} },
      trigger: 'emit'
    });

    resolves = resolveFactory(Promise);
    registry = stateRegistry();
    machine = stateMachine(events, registry, Promise);

    rootState = registry.$root;
    rootState.beforeEnter = sinon.spy();
    rootState.beforeUpdate = sinon.spy();
    rootState.beforeExit = sinon.spy();

    initialParams = {};
    initialQuery = {};

    var states = [

      appState = registry
        .add('app', {
          path: '/',
          beforeExit: sinon.spy(),
          beforeUpdate: sinon.spy(),
          beforeEnter: sinon.spy(),
        }),

      fooState = registry
        .add('app.foo', {
          path: 'foo/:fooParam',
          resolve: {
            fooResolve: sinon.spy()
          },
          beforeExit: sinon.spy(),
          beforeUpdate: sinon.spy(),
          beforeEnter: sinon.spy(),
        }),

      barState = registry
        .add('app.foo.bar', {
          path: 'bar?barQuery',
          resolve: {
            barResolve: sinon.spy(function (params) {

              return params.fooParam;
            })
          },
          beforeExit: sinon.spy(),
          beforeUpdate: sinon.spy(),
          beforeEnter: sinon.spy(),
        }),

      bazState = registry
        .add('app.foo.bar.baz', {
          path: '/baz/:bazParam',
          resolve: {
            bazResolve: ['barResolve@app.foo.bar', sinon.spy()]
          },
          beforeExit: sinon.spy(),
          beforeUpdate: sinon.spy(),
          beforeEnter: sinon.spy(),
        }),

      quxState = registry
        .add('qux', {
          path: '/qux',
          beforeExit: sinon.spy(),
          beforeUpdate: sinon.spy(),
          beforeEnter: sinon.spy(),
        }),

      quuxState = registry
        .add('quux', {
          parent: 'qux',
          path: '/:quuxParam',
          resolve: {
            quuxResolve: sinon.spy()
          },
          beforeExit: sinon.spy(),
          beforeUpdate: sinon.spy(),
          beforeEnter: sinon.spy(),
        })
    ];

    states.forEach(function (state) {

      resolves.addTo(state);
    });
  });


  describe('.init(startState, startParams)', function () {

    it('should initialize', function () {

      var rootState = registry.$root;
      var params = {};
      var query = {};

      machine.init(rootState, params, query);

      expect(machine.$state.current).to.equal(rootState);
      expect(machine.$state.params).to.equal(params);
      expect(machine.$state.query).to.equal(query);
      expect(machine.transition).to.equal(null);
    });

  });


  describe('.hasState(stateName, params, query)', function () {

    it('should know whether a state is active', function () {

      expect(machine.hasState('app')).to.equal(false);

      machine.init(
        bazState, { bazParam: '42', fooParam: '7' }, { barQuery: 'smashing' }
      );

      var hasRoot = machine.hasState('');
      var hasFoo = machine.hasState('app.foo', { fooParam: '7' });

      expect(hasRoot).to.equal(true);
      expect(hasFoo).to.equal(true);

      machine.init(quxState, {}, {});

      var hasQux = machine.hasState('qux');

      expect(hasQux).to.equal(true);
    });

  });


  describe('.createTransition(state, params, query, options)', function () {

    it('should create a transition from "root" to "app"', function () {

      var params = {};
      var query = {};

      machine.init(registry.$root, initialParams, initialQuery);

      var transition = machine.createTransition(appState, params, query);

      expect(transition._tasks.length).to.equal(0);
      expect(transition._exiting.length).to.equal(0);

      expect(rootState.beforeEnter.called).to.equal(false);
      expect(rootState.beforeUpdate.called).to.equal(false);
      expect(rootState.beforeExit.called).to.equal(false);

      expect(appState.beforeEnter.calledOnce).to.equal(true);
      expect(appState.beforeUpdate.called).to.equal(false);
      expect(appState.beforeExit.called).to.equal(false);
    });


    it('should create a transition from "root" to "foo"', function () {

      var params = { fooParam: '42' };
      var query = {};

      machine.init(registry.$root, initialParams, initialQuery);

      var transition = machine.createTransition(fooState, params, query);

      expect(transition._tasks.length).to.equal(1);
      expect(transition._exiting.length).to.equal(0);

      expect(rootState.beforeEnter.called).to.equal(false);
      expect(rootState.beforeUpdate.called).to.equal(false);
      expect(rootState.beforeExit.called).to.equal(false);

      expect(appState.beforeEnter.calledOnce).to.equal(true);
      expect(appState.beforeUpdate.called).to.equal(false);
      expect(appState.beforeExit.called).to.equal(false);

      expect(fooState.beforeEnter.calledOnce).to.equal(true);
      expect(fooState.beforeUpdate.called).to.equal(false);
      expect(fooState.beforeExit.called).to.equal(false);
    });


    it('should create a transition from "root" to "baz"', function () {

      var params = { fooParam: '42', bazParam: '7' };
      var query = { barQuery: 'q' };

      machine.init(rootState, initialParams, initialQuery);

      var transition = machine.createTransition(bazState, params, query);

      expect(transition._tasks.length).to.equal(3);
      expect(transition._exiting.length).to.equal(0);

      expect(rootState.beforeEnter.called).to.equal(false);
      expect(rootState.beforeUpdate.called).to.equal(false);
      expect(rootState.beforeExit.called).to.equal(false);

      expect(appState.beforeEnter.calledOnce).to.equal(true);
      expect(fooState.beforeEnter.calledOnce).to.equal(true);
      expect(barState.beforeEnter.calledOnce).to.equal(true);
      expect(bazState.beforeEnter.calledOnce).to.equal(true);
    });


    it('should create a transition from "baz" to "app"', function () {

      machine.init(bazState, {}, {});

      var transition = machine.createTransition(appState, {}, {});

      expect(transition._tasks.length).to.equal(0);
      expect(transition._exiting.length).to.equal(3);

      expect(appState.beforeEnter.called).to.equal(false);
      expect(appState.beforeUpdate.called).to.equal(false);
      expect(appState.beforeExit.calledOnce).to.equal(false);

      expect(fooState.beforeEnter.called).to.equal(false);
      expect(fooState.beforeUpdate.called).to.equal(false);
      expect(fooState.beforeExit.calledOnce).to.equal(true);

      expect(barState.beforeEnter.called).to.equal(false);
      expect(barState.beforeUpdate.called).to.equal(false);
      expect(barState.beforeExit.calledOnce).to.equal(true);

      expect(bazState.beforeEnter.called).to.equal(false);
      expect(bazState.beforeUpdate.called).to.equal(false);
      expect(bazState.beforeExit.calledOnce).to.equal(true);
    });


    it('should create a transition from "baz" to "qux"', function () {

      machine.init(bazState, {}, {});

      var transition = machine.createTransition(quxState, {}, {});

      expect(transition._tasks.length).to.equal(0);
      expect(transition._exiting.length).to.equal(4);

      expect(appState.beforeEnter.called).to.equal(false);
      expect(appState.beforeUpdate.called).to.equal(false);
      expect(appState.beforeExit.calledOnce).to.equal(true);

      expect(fooState.beforeEnter.called).to.equal(false);
      expect(fooState.beforeUpdate.called).to.equal(false);
      expect(fooState.beforeExit.calledOnce).to.equal(true);

      expect(barState.beforeEnter.called).to.equal(false);
      expect(barState.beforeUpdate.called).to.equal(false);
      expect(barState.beforeExit.calledOnce).to.equal(true);

      expect(bazState.beforeEnter.called).to.equal(false);
      expect(bazState.beforeUpdate.called).to.equal(false);
      expect(bazState.beforeExit.calledOnce).to.equal(true);

      expect(quxState.beforeEnter.calledOnce).to.equal(true);
      expect(quxState.beforeUpdate.called).to.equal(false);
      expect(quxState.beforeExit.called).to.equal(false);
    });

  });


  describe('.transitionTo(stateOrName, params, query, options)', function () {

    it('should transition from "root" to "app"', function (done) {

      machine.init(rootState, initialParams, initialQuery);

      var params = {};
      var query = {};

      return machine
        .transitionTo(appState, params, query)
        .then(function (transition) {
          transition._commit();
          expect(machine.$state.current).to.equal(appState);
          expect(machine.$state.params).to.equal(params);
          expect(machine.$state.query).to.equal(query);
          transition._cleanup();
          return done();
        });
    });


    it('should transition from "root" to "app" by name', function (done) {

      machine.init(rootState, initialParams, initialQuery);

      var params = {};
      var query = {};

      return machine
        .transitionTo('app', params, query)
        .then(function (transition) {
          transition._commit();
          expect(machine.$state.current).to.equal(appState);
          expect(machine.$state.params).to.equal(params);
          expect(machine.$state.query).to.equal(query);
          transition._cleanup();
          return done();
        });
    });



    it('should transition from "root" to "foo"', function (done) {

      machine.init(rootState, initialParams, initialQuery);

      var params = { fooParam: '42' };
      var query = {};

      return machine.transitionTo(fooState, params, query)
        .then(function (transition) {
          transition._commit();
          expect(fooState.resolve.fooResolve.called).to.equal(true);
          expect(machine.$state.current).to.equal(fooState);
          expect(machine.$state.params).to.equal(params);
          expect(machine.$state.query).to.equal(query);
          transition._cleanup();
          return done();
        });
    });


    it('should transition from "root" to "bar"', function (done) {

      machine.init(rootState, initialParams, initialQuery);

      var params = { fooParam: '42' };
      var query = { barQuery: '7' };

      return machine.transitionTo(barState, params, query)
        .then(function (transition) {
          transition._commit();
          expect(fooState.resolve.fooResolve.called).to.equal(true);
          expect(barState.resolve.barResolve.called).to.equal(true);
          expect(machine.$state.current).to.equal(barState);
          expect(machine.$state.params).to.equal(params);
          expect(machine.$state.query).to.equal(query);
          transition._cleanup();
          return done();
        });
    });


    it('should transition from "foo" to "bar"', function (done) {

      machine.init(fooState, { fooParam: '42' }, {});
      machine.cache.set('fooResolve@app.foo', '42');

      var params = { fooParam: '42' };
      var query = { barQuery: '7' };

      return machine
        .transitionTo(barState, params, query)
        .then(function (transition) {
          transition._commit();
          expect(fooState.resolve.fooResolve.called).to.equal(false);
          expect(barState.resolve.barResolve.called).to.equal(true);
          expect(machine.$state.current).to.equal(barState);
          expect(machine.$state.params).to.equal(params);
          expect(machine.$state.query).to.equal(query);
          transition._cleanup();
          return done();
        });
    });


    it('should transition from "foo" to "baz"', function () {

      machine.init(fooState, { fooParam: '42' }, {});

      var params = { fooParam: '42', bazParam: '50' };
      var query = { barQuery: '7' };

      return machine
        .transitionTo(bazState, params, query);

    });


    it('should transition from "baz" to "quux"', function (done) {

      machine.init(
        bazState, { fooParam: '42', bazParam: '24' }, { barQuery: '7' }
      );

      var params = { quuxParam: 'fin' };
      var query = {};

      return machine
        .transitionTo(quuxState, params, query)
        .then(function (transition) {
          transition._commit();
          expect(fooState.resolve.fooResolve.called).to.equal(false);
          expect(quuxState.resolve.quuxResolve.calledOnce).to.equal(true);
          expect(machine.$state.current).to.equal(quuxState);
          expect(machine.$state.params).to.equal(params);
          expect(machine.$state.query).to.equal(query);
          transition._cleanup();
          return done();
        });
    });


    it('should rethrow any unhandled resolve error', function () {

      machine.init(rootState, initialParams, initialQuery);

      sinon
        .stub(registry.states['app.foo'].$resolves[0], 'execute')
        .throws(new Error('oops!'));

      var params = { fooParam: 'foo' };
      var query = {};

      return expect(machine.transitionTo('app.foo', params, query))
            .to.eventually.be.rejectedWith(Error, 'oops!');
    });


    it('should not run resolves if canceled by hook', function (done) {

      appState.beforeEnter = function (transition) {

        transition.cancel();
      };

      machine.init(rootState, {}, {});

      return machine
        .transitionTo(fooState, { fooParam: '42' }, { barQuery: '7' })
        .catch(function (err) {
          expect(err.message).to.equal('transition canceled');
          expect(fooState.resolve.fooResolve.called).to.equal(false);
          return done();
        });
    });


    it('should not run resolves if superseded by hook', function (done) {

      appState.beforeEnter = function (transition) {

        transition.redirect('qux', {}, {});
      };

      machine.init(rootState, {}, {});

      return machine
        .transitionTo(fooState, { fooParam: '42' }, { barQuery: '7' })
        .catch(function (err) {
          expect(err.message).to.equal('transition superseded');
          expect(fooState.resolve.fooResolve.called).to.equal(false);
          return done();
        });
    });


    it('should not run resolves if canceled by listener', function (done) {

      machine.init(rootState, {}, {});

      events.notify = function (eventName, transition) {

        eventName === 'stateChangeStart' && transition.cancel();
      };

      return machine
        .transitionTo(fooState, { fooParam: '42' }, { barQuery: '7' })
        .catch(function (err) {
          expect(err.message).to.equal('transition canceled');
          expect(fooState.resolve.fooResolve.called).to.equal(false);
          return done();
        });
    });


    it('should not run resolves if superseded by listener', function (done) {

      machine.init(rootState, {}, {});

      events.notify = function (eventName, transition) {

        eventName === 'stateChangeStart' &&
        transition.toState.name !== 'qux' &&
        transition.redirect('qux', {}, {});
      };

      return machine
        .transitionTo(fooState, { fooParam: '42' }, { barQuery: '7' })
        .catch(function (err) {
          expect(err.message).to.equal('transition superseded');
          expect(fooState.resolve.fooResolve.called).to.equal(false);
          return done();
        });
    });

  });

});