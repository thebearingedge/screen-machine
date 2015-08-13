
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);


var Transition = require('../modules/Transition');


describe('Transition', function () {

  var transition, machine, to, toParams;

  beforeEach(function () {

    machine = {
      transitionTo: sinon.spy(),
      init: sinon.spy(),
      currentState: {
        getBranch: function () { return []; }
      },
      currentParams: {}
    };
    to = {
      getBranch: function () { return []; }
    };
    toParams = {};
    transition = new Transition(machine, to, toParams);
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

      transition.succeeded = true;

      expect(transition.isCanceled()).to.equal(false);
    });

  });


  describe('.finish()', function () {

    it('should reinitialize the state machine', function () {

      transition.finish();

      expect(transition.succeeded).to.equal(true);
      expect(machine.init).to.have.been.calledWithExactly(to, toParams);
    });

  });


  describe('.redirect(state, params)', function () {

    it('should start a new machine transition with args', function () {

      transition.redirect('foo', { bar: 'baz' });

      expect(machine.transitionTo)
        .to.have.been.calledWithExactly('foo', { bar: 'baz' });
    });

  });


  describe('.retry()', function () {

    it('should start a new machine transition with current args', function () {

      transition.retry();

      expect(machine.transitionTo)
        .to.have.been.calledWithExactly(to, toParams);
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

      expect(transition.canceled).to.equal(true);
      expect(transition.handled).to.equal(false);
      expect(transition.error).to.equal(err);
    });

  });


  describe('.isHandled()', function () {

    it('should tell if user claims to have handled the error', function () {

      transition.handled = true;

      expect(transition.isHandled()).to.equal(true);
    });

  });


  describe('.errorHandled()', function () {

    it('should mark the transition handled', function () {

      transition.setError({});
      transition.errorHandled();

      expect(transition.handled).to.equal(true);
    });

  });

});
