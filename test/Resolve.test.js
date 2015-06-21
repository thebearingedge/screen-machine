
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var Promise = require('native-promise-only');

var Resolve = require('../Resolve');
var StateNode = require('../StateNode');

describe('Resolve(state)', function () {

  var resolve, chain, resolves, dependents;

  beforeEach(function () {

    resolve = new Resolve(Promise);
    chain = resolve._chain;
    resolves = resolve._resolves;
    dependents = resolve._dependents;
  });


  describe('.addState(state)', function () {

    beforeEach(function () {

      sinon.stub(resolve, '_registerState');
      sinon.stub(resolve, '_triageState');
    });


    afterEach(function () {

      resolve._registerState.restore();
      resolve._triageState.restore();
    });


    it('should triage a state with dependencies', function () {

      var bar = new StateNode({ name: 'bar', waitFor: ['foo@foo'] });

      resolve.addState(bar);

      expect(resolve._registerState.called).to.equal(false);
      expect(resolve._triageState.calledOnce).to.equal(true);
      expect(resolve._triageState).to.have.been.calledWithExactly(bar);
    });


    it('should register a state with no dependencies', function () {

      var bar = new StateNode({ name: 'bar' });

      resolve.addState(bar);

      expect(resolve._triageState.called).to.equal(false);
      expect(resolve._registerState.calledOnce).to.equal(true);
      expect(resolve._registerState).to.have.been.calledWithExactly(bar);
    });

  });


  describe('._registerState', function () {

    var state, fooResolve, barResolve;

    beforeEach(function () {

      fooResolve = function () {};
      barResolve = function () {};

      state = new StateNode({
        name: 'fooBar',
        resolve: {
          fooResolve: fooResolve,
          barResolve: barResolve
        }
      });

    });


    it('should push resolves into the FIRST level of the chain', function () {

      resolve._registerState(state);

      expect(chain.length).to.equal(1);
      expect(chain[0].length).to.equal(2);
    });


    it('should push resolves into the GIVEN level of the chain', function () {

      resolve._registerState(state, 1);

      expect(chain.length).to.equal(2);
      expect(chain[0].length).to.equal(0);
      expect(chain[1].length).to.equal(2);
    });


    it('should register the depth of the state resolves', function () {

      resolve._registerState(state, 1);

      expect(resolves['fooResolve@fooBar'].depth).to.equal(1);
      expect(resolves['barResolve@fooBar'].depth).to.equal(1);
    });


    it('should register the position of the state resolves', function () {

      resolve._registerState(state);

      expect(typeof resolves['fooResolve@fooBar'].position).to.equal('number');
      expect(typeof resolves['barResolve@fooBar'].position).to.equal('number');
    });


    it('should register the owner state of the state resolves', function () {

      resolve._registerState(state);

      expect(resolves['fooResolve@fooBar'].state).to.equal(state);
      expect(resolves['barResolve@fooBar'].state).to.equal(state);
    });

  });


  describe('._queueDependent', function () {

    var bazState, quxState;

    beforeEach(function () {

      bazState = new StateNode({
        name: 'baz',
        waitFor: ['fooResolve@foo', 'barResolve@bar']
      });

      quxState = new StateNode({
        name: 'qux',
        waitFor: ['barResolve@bar']
      });

    });


    it('should hold a reference to the state for each dependency', function () {

      var result = {
        'fooResolve@foo': {
          baz: bazState
        },
        'barResolve@bar': {
          baz: bazState,
          qux: quxState
        }
      };

      resolve._queueDependent(bazState);
      resolve._queueDependent(quxState);

      expect(dependents).to.deep.equal(result);
    });

  });


  describe('._triageState(state)', function () {

    beforeEach(function () {

      sinon.stub(resolve, '_queueDependent');
      sinon.stub(resolve, '_getInsertDepth').returns(1);
      sinon.stub(resolve, '_registerState');
    });

    afterEach(function () {

      resolve._queueDependent.restore();
      resolve._getInsertDepth.restore();
      resolve._registerState.restore();
    });


    it('should send a state to the dependents queue', function () {

      var bar = new StateNode({ name: 'bar', waitFor: ['resolve@foo'] });

      resolve._triageState(bar);

      expect(resolve._queueDependent.calledOnce).to.equal(true);
      expect(resolve._queueDependent).to.have.been.calledWithExactly(bar);
    });


    it('should register a state that is ready', function () {

      var bar = new StateNode({ name: 'bar', waitFor: ['resolve@foo'] });

      resolves['resolve@foo'] = {};

      resolve._triageState(bar);

      expect(resolve._getInsertDepth.calledOnce).to.equal(true);
      expect(resolve._getInsertDepth)
        .to.have.been.calledWithExactly(bar.waitFor);
      expect(resolve._registerState.calledOnce).to.equal(true);
      expect(resolve._registerState)
        .to.have.been.calledWithExactly(bar, 1);
    });

  });


  describe('._getInsertDepth(waitFor)', function () {


    it('should return at least `1`', function () {

      expect(resolve._getInsertDepth([])).to.equal(1);
    });


    it('should return `1` deeper than the deepest dependency', function () {

      resolves['foo@foo'] = { depth: 3 };
      resolves['bar@bar'] = { depth: 4 };
      resolves['baz@baz'] = { depth: 2 };

      var depth = resolve
        ._getInsertDepth(['baz@baz', 'bar@bar', 'foo@foo']);

      expect(depth).to.equal(5);
    });

  });


  describe('._flushDependentsOf(state)', function () {

    var bar, baz;

    beforeEach(function () {

      bar = {};
      baz = {};

      resolve._dependents = {
        'fooResolve@foo': {
          bar: bar,
          baz: baz
        }
      };

      sinon.stub(resolve, '_triageState');
    });


    afterEach(function () {

      resolve._triageState.restore();
    });


    it('should send dependents to through triage', function () {

      resolve._flushDependentsOf('fooResolve@foo');

      expect(resolve._triageState.calledTwice).to.equal(true);
    });

  });


});