
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var Promise = require('native-promise-only');
var stateMachine = require('../modules/stateMachine');
var State = require('../modules/State');
var SimpleResolve = require('../modules/SimpleResolve');
var DependentResolve = require('../modules/DependentResolve');
var Transition = require('../modules/Transition');


describe('Transition', function () {

  var transition, machine, toState, toParams, toQuery;

  beforeEach(function () {

    machine = stateMachine({}, Promise);
    toParams = {};
    toQuery = {};
    toState = {};
    transition = new Transition(machine, toState, toParams, toQuery);
    machine.transition = transition;
  });


  describe('.isCanceled()', function () {

    it('should not be initially canceled', function () {

      expect(transition.isCanceled()).to.equal(false);
    });


    it('should be canceled if it is superceded', function () {

      machine.transition = {};

      expect(transition.isCanceled()).to.equal(true);
    });


    it('should not be canceled if it already finished', function () {

      transition._succeeded = true;

      expect(transition.isCanceled()).to.equal(false);
    });

  });


  describe('.isSuccessful()', function () {

    it('should not be initially successful', function () {

      expect(transition.isSuccessful()).to.equal(false);
    });

  });


  describe('._finish()', function () {

    it('should reinitialize the state machine', function () {

      sinon.spy(machine, 'init');
      transition.prepare([], [], Promise);
      transition._finish();

      expect(transition._succeeded).to.equal(true);
      expect(machine.init)
        .to.have.been.calledWithExactly(toState, toParams, toQuery);
    });

  });


  describe('.redirect(state, params, query)', function () {

    it('should start a new machine transition with args', function () {

      sinon.stub(machine, 'transitionTo');

      transition.redirect('foo', { bar: 'baz' }, { qux: 'quux' });

      expect(machine.transitionTo)
        .to.have.been.calledWithExactly('foo', { bar: 'baz' }, { qux: 'quux' });
    });

  });


  describe('.retry()', function () {

    it('should start a new machine transition with current args', function () {

      sinon.stub(machine, 'transitionTo');

      transition.retry();

      expect(machine.transitionTo)
        .to.have.been.calledWithExactly(toState, toParams, toQuery);
    });

  });


  describe('.cancel()', function () {

    it('should cancel the current transition', function () {

      transition.cancel();

      expect(transition.isCanceled()).to.equal(true);
    });

  });


  describe('.setError(err)', function () {

    it('should cancel the transition and mark it unhandled', function () {

      var err = new Error();

      transition.setError(err);

      expect(transition._canceled).to.equal(true);
      expect(transition._handled).to.equal(false);
      expect(transition.error).to.equal(err);
    });

  });


  describe('.isHandled()', function () {

    it('should tell if user claims to have handled the error', function () {

      transition._handled = true;

      expect(transition.isHandled()).to.equal(true);
    });

  });


  describe('.errorHandled()', function () {

    it('should mark the transition handled', function () {

      transition.setError({});
      transition.errorHandled();

      expect(transition._handled).to.equal(true);
    });

  });


  describe('.prepare(resolves, cache, exiting, Promise)', function () {

    var state, cache;
    var fooResolve, barResolve;

    beforeEach(function () {

      state = new State({
        name: 'state',
        resolve: {
          foo: function () {},
          bar: ['foo', function () {}]
        }
      });

      fooResolve = new SimpleResolve('foo', state, Promise);
      barResolve = new DependentResolve('bar', state, Promise);
      cache = machine.cache;
    });

    it('should pull missing dependencies from the cache', function () {

      var cacheSpy = sinon.spy(cache, 'get');

      transition.prepare([barResolve], cache, [], Promise);

      expect(cacheSpy).to.have.been.calledWithExactly('foo@state');
    });


    it('should NOT THROW if the task dependencies are ACYCLIC', function () {

      expect(transition.prepare([fooResolve, barResolve], cache))
        .to.not.throw;
    });


    it('should THROW if the task dependencies are CYCLIC', function () {

      fooResolve.injectables = ['bar@state'];
      var message = 'Cyclic resolve dependency: ' +
                    'foo@state -> bar@state -> foo@state';

      expect(
        transition.prepare.bind(transition, [fooResolve, barResolve], cache)
      ).to.throw(Error, message);
    });

  });

});
