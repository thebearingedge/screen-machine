
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var Promise = require('native-promise-only');
import stateMachine from '../modules/stateMachine';
var State = require('../modules/State');
import SimpleResolve from '../modules/SimpleResolve';
import DependentResolve from '../modules/DependentResolve';
import Transition from '../modules/Transition';


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


  describe('.cancel()', function () {

    it('should cancel the current transition', function () {

      transition.cancel();

      expect(transition.isCanceled()).to.equal(true);
    });


    it('should not be cancelable if succeeded', function () {

      transition._succeeded = true;

      transition.cancel();

      expect(transition._canceled).to.equal(false);
    });

  });


  describe('.isCanceled()', function () {

    it('should not be initially canceled', function () {

      expect(transition.isCanceled()).to.equal(false);
    });


    it('should not be canceled if it already succeeded', function () {

      transition._succeeded = true;

      expect(transition.isCanceled()).to.equal(false);
    });

  });


  describe('.isSuccessful()', function () {

    it('should not be initially successful', function () {

      expect(transition.isSuccessful()).to.equal(false);
    });


    it('should be successful if succeeded and not superceded', function () {

      transition._succeeded = true;

      expect(transition.isSuccessful()).to.equal(true);
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


  describe('._prepare(resolves, cache, exiting, Promise)', function () {

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

      transition._prepare([barResolve], cache, [], Promise);

      expect(cacheSpy).to.have.been.calledWithExactly('foo@state');
    });


    it('should NOT THROW if the task dependencies are ACYCLIC', function () {

      expect(transition._prepare([fooResolve, barResolve], cache))
        .to.not.throw;
    });


    it('should THROW if the task dependencies are CYCLIC', function () {

      fooResolve.injectables = ['bar@state'];
      var message = 'Cyclic resolve dependency: ' +
                    'foo@state -> bar@state -> foo@state';

      expect(
        transition._prepare.bind(transition, [fooResolve, barResolve], cache)
      ).to.throw(Error, message);
    });

  });

});
