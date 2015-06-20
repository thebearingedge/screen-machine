
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


  describe('#initialize()', function () {

    it('should return current instance', function () {

      stateNode = new StateNode();

      expect(stateNode.initialize()).to.equal(stateNode);
    });

  });


  describe('#getParentName', function () {

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

  describe('#_inheritData()', function () {

    it('should override and combine with parent data on child', function () {

      childNode._parent = parentNode;

      childNode._inheritData();

      expect(childNode.data)
        .to.deep.equal({ foo: 'bar', quux: 'corge' });
    });


    it('should not inherit data if no parent', function () {

      parentNode._inheritData();

      expect(parentNode.data).to.deep.equal({ foo: 'qux', quux: 'corge' });
    });

  });


  describe('#_inheritIncludes()', function () {

    it('should inherit parent node includes', function () {

      childNode._parent = parentNode;

      childNode._inheritIncludes();

      expect(childNode._includes).to.deep.equal({ parent: true, child: true });
    });

  });


  describe('#_inheritLineage()', function () {

    var grandchildNode = new StateNode({ name: 'grandchild' });

    beforeEach(function () {
      childNode._parent = parentNode;
      grandchildNode._parent = childNode;
    });

    it('should add a lineage array to the node', function () {

      parentNode._inheritLineage();
      childNode._inheritLineage();
      grandchildNode._inheritLineage();

      expect(parentNode._branch)
        .to.deep.equal([parentNode]);
      expect(childNode._branch)
        .to.deep.equal([parentNode, childNode]);
      expect(grandchildNode._branch)
        .to.deep.equal([parentNode, childNode, grandchildNode]);

    });

  });


  describe('#_registerResolves()', function () {

    it('should create an array of invokables on the node', function () {

      parentNode.resolve = {
        foo: function () {},
        bar: function () {}
      };

      parentNode._registerResolves();

      expect(parentNode._resolveables[0]).to.equal(parentNode.resolve.foo);
      expect(parentNode._resolveables[1]).to.equal(parentNode.resolve.bar);
    });

  });


  describe('#attachTo(parentNode)', function () {

    it('should set parent on the node and run inheritance', function () {

      sinon.spy(childNode, '_inheritIncludes');
      sinon.spy(childNode, '_inheritData');
      sinon.spy(childNode, '_inheritLineage');

      childNode.attachTo(parentNode);

      expect(childNode._parent).to.equal(parentNode);
      expect(childNode._inheritIncludes.calledOnce).to.equal(true);
      expect(childNode._inheritData.calledOnce).to.equal(true);
      expect(childNode._inheritLineage.calledOnce).to.equal(true);
    });

  });


  describe('#getBranch()', function () {

    it('should return the stateNode lineage', function () {

      parentNode._branch = [];

      expect(parentNode.getBranch()).to.equal(parentNode._branch);
    });

  });


  describe('#isStale(newParams)', function () {

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


  describe('#contains(node)', function () {

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


  describe('#getOwnParams(params)', function () {

    it('should filter params to with own params keys', function () {

      parentNode._paramKeys = ['foo', 'bar'];
      var params = { foo: 'baz', bar: 'qux', quux: 'corge' };
      var ownParams = parentNode.getOwnParams(params);

      expect(ownParams).to.deep.equal({ foo: 'baz', bar: 'qux' });
    });

  });


  describe('#load(params)', function () {

    var params;

    beforeEach(function () {
      params = { foo: 'bar', baz: 'qux' };
      parentNode._paramKeys = ['foo'];
      parentNode._resolveables = [
        sinon.spy(function () { return { foo: true }; }),
        'resolveValue'
      ];

      sinon.spy(parentNode, 'getOwnParams');
      sinon.spy(parentNode, 'onEnter');
    });

    afterEach(function () {
      parentNode.getOwnParams.restore();
    });

    it('should filter params to ownParams', function () {

      parentNode.load(params);

      expect(parentNode.getOwnParams.calledOnce).to.equal(true);
      expect(parentNode.getOwnParams)
        .to.have.been.calledWithExactly(params);
    });


    it('should set params on the state', function () {

      parentNode.load(params);

      expect(parentNode._params).to.deep.equal({ foo: 'bar' });
    });


    it('should invoke node resolveables with ownParams', function () {

      parentNode.load(params);

      expect(parentNode._resolveables[0])
        .to.have.been.calledWithExactly({ foo: 'bar' });
    });


    it('should call `onEnter` with resolved values', function () {

      parentNode.load(params);

      expect(parentNode.onEnter)
        .to.have.been.calledWithExactly({ foo: true }, 'resolveValue');
    });


    it('should create a bound _onExit callback', function () {

      sinon.spy(parentNode, 'onExit');
      expect(parentNode._onExit).to.equal(undefined);

      parentNode.load(params);

      expect(typeof parentNode._onExit).to.equal('function');

      parentNode._onExit();

      expect(parentNode.onExit)
        .to.have.been.calledWithExactly({ foo: true }, 'resolveValue');
      expect(parentNode._onExit).to.equal(undefined);
    });

  });


  describe('#unload()', function () {

    it('should call the instance onExit method', function () {

      parentNode._onExit = sinon.spy();

      parentNode.unload();

      expect(parentNode._onExit.calledOnce).to.equal(true);
    });


    it('should `null` the instance `resolved` and `params`', function () {

      parentNode._onExit = function () {};
      parentNode._params = {};

      parentNode.unload();

      expect(parentNode._params).to.equal(null);
    });

  });

});