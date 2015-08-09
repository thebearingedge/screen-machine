
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);


var resolveCache = require('../modules/resolveCache');
var ResolveTask = require('../modules/ResolveTask');
var BaseComponent = require('../modules/BaseComponent');
var viewTree = require('../modules/viewTree');
var resolveService = require('../modules/resolveService');
var stateRegistry = require('../modules/stateRegistry');
var router = require('../modules/router');


var stateMachine = require('../modules/stateMachine');


describe('stateMachine', function () {

  var window, routerOptions, views, resolves, routes, registry, events, machine;


  beforeEach(function () {

    window = { history: {}, location: {} };
    routerOptions = {};

    views = viewTree(BaseComponent);
    resolves = resolveService(Promise);
    routes = router(window, routerOptions);
    registry = stateRegistry(views, resolves, routes);

    machine = stateMachine(events, resolves);
  });

  afterEach(function () {

    expect(global.params).to.equal(undefined);
  });


  describe('.init(startState, startParams)', function () {

    it('should initialize', function () {

      var rootState = registry.$root;
      var startParams = {};

      machine.init(rootState, startParams);

      expect(machine.currentState).to.equal(rootState);
      expect(machine.currentParams).to.equal(startParams);
    });

  });


  describe('.transitionTo(toState, toParams)', function () {

    var rootState, appState, fooState, barState, bazState;
    var initialParams;

    beforeEach(function () {

      rootState = registry.$root;
      initialParams = {};

      registry
        .add('app', {
          path: '/'
        })
        .add('app.foo', {
          path: '/foo/:fooParam',
          resolve: {
            fooResolve: sinon.spy()
          }
        })
        .add('app.foo.bar', {
          path: '/bar?barParam',
          resolve: {
            barResolve: sinon.spy(function (params) {

              return params.fooParam;
            })
          }
        })
        .add('app.foo.bar.baz', {
          path: '/baz/:bazParam',
          resolve: {
            bazResolve: ['barResolve@app.foo.bar', sinon.spy()]
          }
        });

      appState = registry.states.app;
      fooState = registry.states['app.foo'];
      barState = registry.states['app.foo.bar'];
      bazState = registry.states['app.foo.bar.baz'];
    });


    it('should transition from "root" to "app"', function (done) {

      machine.init(rootState, initialParams);

      var toParams = {};

      return machine
        .transitionTo(appState, toParams)
        .then(function () {

          expect(machine.currentState).to.equal(appState);
          expect(machine.currentParams).to.equal(toParams);
          return done();
        });
    });


    it('should transition from "root" to "foo"', function (done) {

      machine.init(rootState, initialParams);

      var toParams = { fooParam: '42' };

      return machine
        .transitionTo(fooState, toParams)
        .then(function () {

          expect(fooState.resolve.fooResolve)
            .to.have.been.calledWithExactly({ fooParam: '42' });
          expect(machine.currentState).to.equal(fooState);
          expect(machine.currentParams).to.equal(toParams);
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
          expect(machine.currentState).to.equal(barState);
          expect(machine.currentParams).to.equal(toParams);
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
          expect(machine.currentState).to.equal(bazState);
          expect(machine.currentParams).to.equal(toParams);
          return done();
        });
    });


  });


});