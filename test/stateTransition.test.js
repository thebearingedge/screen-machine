
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var StateNode = require('../StateNode');
var StateTree = require('../StateTree');
var stateTransition = require('../stateTransition');

describe('StateTransition', function () {

  var tree, rootNode, fooNode, barNode, bazNode;

  beforeEach(function () {

    tree = new StateTree(StateNode);

    tree
      .attach('foo', {
        _paramKeys: [ 'fooParam' ],
        resolve: {
          resolveFoo: function (params) {

            return 'foo resolve: ' + params.fooParam;
          }
        },
        onEnter: function (resolveFoo) {

          return resolveFoo;
        },
        onExit: function (resolveFoo) {

          return resolveFoo;
        }
      })
      .attach('bar.baz', {
        _paramKeys: [ 'bazParam' ],
        resolve: {
          bazResolve: function (params) {

            return 'baz resolve: ' + params.bazParam;
          }
        },
        onEnter: function (bazResolve) {

          return bazResolve;
        },
        onExit: function (bazResolve) {

          return bazResolve;
        }
      })
      .attach('bar', {
        _paramKeys: [ 'barParam', 'barBarParam' ],
        resolve: {
          resolveBar: function (params) {

            return 'bar resolve: ' + params.barParam;
          },
          resolveBarBar: function (params) {

            return 'barBar resolve: ' + params.barBarParam;
          }
        },
        onEnter: function (resolveBar, resolveBarBar) {

          return resolveBarBar;
        },
        onExit: function (resolveBar, resolveBarBar) {

          return resolveBarBar;
        }
      });

    rootNode = tree.$root;
    sinon.spy(rootNode, 'load');
    sinon.spy(rootNode, 'unload');

    fooNode = tree._nodes.foo;
    sinon.spy(fooNode, 'load');
    sinon.spy(fooNode, 'unload');

    barNode = tree._nodes.bar;
    sinon.spy(barNode, 'load');
    sinon.spy(barNode, 'unload');

    bazNode = tree._nodes['bar.baz'];
    sinon.spy(bazNode, 'load');
    sinon.spy(bazNode, 'unload');
  });


  it('should transition from "$root" to "foo"', function () {

    var params = { fooParam: 'FOO', barParam: 'BAR' };

    var newNode = stateTransition(rootNode, fooNode, params).go();

    expect(rootNode.load.called).to.equal(false);
    expect(rootNode.unload.called).to.equal(false);

    expect(fooNode.load.calledOnce).to.equal(true);
    expect(fooNode.load).to.have.been.calledWithExactly(params);
    expect(fooNode.unload.called).to.equal(false);

    expect(newNode).to.equal(fooNode);
  });


  it('should transition from "foo" to "baz"', function () {

    fooNode._onExit = function () {};

    var params = {
      barParam: 'BAR',
      barBarParam: 'BARBAR',
      bazParam: 'BAZ'
    };

    var newNode = stateTransition(fooNode, bazNode, params).go();

    expect(rootNode.load.called).to.equal(false);
    expect(rootNode.unload.called).to.equal(false);

    expect(fooNode.unload.calledOnce).to.equal(true);
    expect(fooNode.load.called).to.equal(false);

    expect(barNode.load.calledOnce).to.equal(true);
    expect(barNode.load).to.have.been.calledWithExactly(params);
    expect(barNode.unload.called).to.equal(false);

    expect(bazNode.load.calledOnce).to.equal(true);
    expect(bazNode.load).to.have.been.calledWithExactly(params);
    expect(bazNode.unload.called).to.equal(false);

    expect(newNode).to.equal(bazNode);
  });


  it('should transition from "baz" to "bar" WITHOUT reload', function () {

    bazNode._onExit = function () {};

    var params = {
      barParam: 'BAR',
      barBarParam: 'BARBAR'
    };

    barNode._params = { barParam: 'BAR', barBarParam: 'BARBAR' };

    var newNode = stateTransition(bazNode, barNode, params).go();

    expect(rootNode.load.called).to.equal(false);
    expect(rootNode.unload.called).to.equal(false);

    expect(fooNode.unload.called).to.equal(false);
    expect(fooNode.load.called).to.equal(false);

    expect(barNode.load.called).to.equal(false);
    expect(barNode.unload.called).to.equal(false);

    expect(bazNode.unload.calledOnce).to.equal(true);
    expect(bazNode.load.called).to.equal(false);

    expect(newNode).to.equal(barNode);
  });


  it('should transition from "baz" to "bar" WITH reload', function () {

    bazNode._onExit = function () {};

    var params = {
      barParam: 'BAR',
      barBarParam: 'BARBAR'
    };

    barNode._params = { barParam: 'bar', barBarParam: 'barbar' };

    var newNode = stateTransition(bazNode, barNode, params).go();

    expect(rootNode.load.called).to.equal(false);
    expect(rootNode.unload.called).to.equal(false);

    expect(fooNode.unload.called).to.equal(false);
    expect(fooNode.load.called).to.equal(false);

    expect(barNode.load.called).to.equal(true);
    expect(barNode.load).to.have.been.calledWithExactly(params);
    expect(barNode.unload.called).to.equal(false);

    expect(bazNode.unload.calledOnce).to.equal(true);
    expect(bazNode.load.called).to.equal(false);

    expect(newNode).to.equal(barNode);
  });


  it('should transition from "baz" to "foo"', function () {

    bazNode._onExit = function () {};
    barNode._onExit = function () {};

    var params = {
      fooParam: 'FOO'
    };

    var newNode = stateTransition(bazNode, fooNode, params).go();

    expect(rootNode.load.called).to.equal(false);
    expect(rootNode.unload.called).to.equal(false);

    expect(fooNode.unload.called).to.equal(false);
    expect(fooNode.load.called).to.equal(true);

    expect(barNode.load.called).to.equal(false);
    expect(barNode.unload.called).to.equal(true);

    expect(bazNode.unload.calledOnce).to.equal(true);
    expect(bazNode.load.called).to.equal(false);

    expect(newNode).to.equal(fooNode);
  });

});
