'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);


describe('StateNode', function () {

  var StateNode = require('../StateNode');
  var stateNode;

  it('should instantiate itself', function () {
    // jshint newcap: false
    stateNode = StateNode({ name: 'foo' });

    expect(stateNode instanceof StateNode).to.equal(true);
  });


  describe('.initialize()', function () {

    it('should return the instance', function () {

      stateNode = new StateNode();

      expect(stateNode.initialize()).to.equal(stateNode);
    });

  });


  describe('.getParentName', function () {

    it('should return the explicitly set parent name', function () {

      stateNode = new StateNode({ parent: 'foo' });

      expect(stateNode.getParentName()).to.equal('foo');
    });


    it('should return parent name from dotted name', function () {

      stateNode = new StateNode({ name: 'foo.bar' });

      expect(stateNode.getParentName()).to.equal('foo');
    });


    it('should return `null` if no parent name is found', function () {

      stateNode = new StateNode({ name: 'foo' });

      expect(stateNode.getParentName()).to.equal(null);
    });

  });


  var childNode, parentNode;

  beforeEach(function () {

    childNode = new StateNode({
      name: 'child',
      data: {
        foo: 'bar'
      }
    });

    parentNode = new StateNode({
      name: 'parent',
      data: {
        foo: 'qux',
        quux: 'corge'
      }
    });

  });

  describe('._inheritData()', function () {

    it('should override and combine with parent data on child', function () {

      childNode._parent = parentNode;

      childNode._inheritData();

      expect(childNode.data)
        .to.deep.equal({ foo: 'bar', quux: 'corge' });
    });

  });


  describe('._inheritIncludes()', function () {

    it('should inherit parent node includes', function () {

      childNode._parent = parentNode;

      childNode._inheritIncludes();

      expect(childNode._includes).to.deep.equal({ parent: true, child: true });
    });

  });


  describe('._inheritBranch()', function () {

    var grandchildNode = new StateNode({ name: 'grandchild' });

    beforeEach(function () {

      childNode._parent = parentNode;
      grandchildNode._parent = childNode;
    });


    it('should build a branch array on the node', function () {

      childNode._inheritBranch();
      grandchildNode._inheritBranch();

      expect(parentNode._branch)
        .to.deep.equal([parentNode]);
      expect(childNode._branch)
        .to.deep.equal([parentNode, childNode]);
      expect(grandchildNode._branch)
        .to.deep.equal([parentNode, childNode, grandchildNode]);
    });

  });


  describe('._normalizeResolves()', function () {

    it('should create an array of invokables on the node', function () {

      var foo = function () {};
      var bar = function () {};

      parentNode.resolve = {
        foo: foo,
        bar: bar
      };

      parentNode._normalizeResolves();

      expect(parentNode.resolve['foo@parent']).to.equal(foo);
      expect(parentNode.resolve['bar@parent']).to.equal(bar);
    });

  });


  describe('._normalizeDependenciesOf(invokable)', function () {

    it('should prepend own name to dependencies', function () {

      var baz = function () {};
      var resolve = ['bar', baz];

      parentNode._normalizeDependenciesOf(resolve);

      expect(resolve).to.deep.equal(['bar@parent', baz]);
    });


    it('should not modify external dependencies', function () {

      var baz = function () {};
      var resolve = ['bar@foo', baz];

      parentNode._normalizeDependenciesOf(resolve);

      expect(resolve).to.deep.equal(['bar@foo', baz]);
    });

  });


  describe('.attachTo(parentNode)', function () {

    it('should set parent on the node and run inheritance', function () {

      sinon.spy(childNode, '_inheritIncludes');
      sinon.spy(childNode, '_inheritData');
      sinon.spy(childNode, '_inheritBranch');

      childNode.attachTo(parentNode);

      expect(childNode._parent).to.equal(parentNode);
      expect(childNode._inheritIncludes.calledOnce).to.equal(true);
      expect(childNode._inheritData.calledOnce).to.equal(true);
      expect(childNode._inheritBranch.calledOnce).to.equal(true);
    });

  });


  describe('.getBranch()', function () {

    it('should return the stateNode lineage', function () {

      parentNode._branch = [];

      expect(parentNode.getBranch()).to.equal(parentNode._branch);
    });

  });


  describe('.isStale(newParams)', function () {

    it('should return `false` if node has no paramKeys', function () {

      parentNode._paramKeys = [];

      expect(parentNode.isStale()).to.equal(false);
    });


    it('should return `true` if node currently has no params', function () {

      parentNode._paramKeys = ['foo'];
      parentNode._params = null;

      expect(parentNode.isStale()).to.equal(true);
    });


    it('should return `false` if current params match newParams', function () {

      var newParams = { foo: 'bar', baz: 'qux' };

      parentNode._paramKeys = ['foo'];
      parentNode._params = { foo: 'bar' };

      expect(parentNode.isStale(newParams)).to.equal(false);
    });


    it('should return `true` if newParams differ from params', function () {

      var newParams = { foo: 'quux', baz: 'qux' };

      parentNode._paramKeys = ['foo'];
      parentNode._params = { foo: 'bar' };

      expect(parentNode.isStale(newParams)).to.equal(true);
    });


  });


  describe('.contains(node)', function () {

    it('should return `false` if a node DOES NOT include another', function () {

      expect(childNode.contains(parentNode)).to.equal(false);
    });


    it('should return `true` if a node DOES include another', function () {

      parentNode._includes = { parent: true };
      childNode._includes = { child: true, parent: true };

      expect(childNode.contains(parentNode)).to.equal(true);
      expect(childNode.contains(childNode)).to.equal(true);
      expect(parentNode.contains(childNode)).to.equal(false);
    });

  });


  describe('._getLocalParams(params)', function () {

    it('should filter params to with own params keys', function () {

      parentNode._paramKeys = ['foo', 'bar'];
      var params = { foo: 'baz', bar: 'qux', quux: 'corge' };
      var ownParams = parentNode._getLocalParams(params);

      expect(ownParams).to.deep.equal({ foo: 'baz', bar: 'qux' });
    });

  });

});