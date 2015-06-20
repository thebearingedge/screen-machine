
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var StateTree = require('../StateTree');
var StateNode = require('../StateNode');

describe('StateTree', function () {

  it('should instantiate itself', function () {
    // jshint newcap: false
    expect(StateTree(StateNode) instanceof StateTree).to.equal(true);
  });

  var tree;

  beforeEach(function () {

    tree = new StateTree(StateNode);
  });


  it('should create a $root node', function () {

    expect(tree._nodes['']).to.have.property('name', '$root');
  });


  describe('#getRoot()', function () {

    it('should return the root node of tree', function () {

      expect(tree.getRoot()).to.equal(tree.$root);
    });

  });


  describe('#attach(name, nodeDef)', function () {

    beforeEach(function () {

      sinon.stub(tree, '_registerNode');
    });


    it('should assign `name` to the nodeDef', function () {

      tree.attach('foo', {});

      expect(tree._registerNode.getCall(0).args[0].name).to.equal('foo');
    });


    it('should support pre-named nodeDefs', function () {

      tree.attach({ name: 'foo' });

      expect(tree._registerNode.getCall(0).args[0].name).to.equal('foo');
    });

  });


  describe('#_queueLeaf(node)', function () {

    it('should enqueue a node with an unregistered parent', function () {

      var bar = new StateNode({ parent: 'foo' });
      var baz = new StateNode({ parent: 'foo' });

      tree._queueLeaf(bar);
      tree._queueLeaf(baz);

      expect(tree._leafQueue.foo[0]).to.equal(bar);
      expect(tree._leafQueue.foo[1]).to.equal(baz);
    });

  });


  describe('#_registerNode(node)', function () {

    it('should enqueue an instance of StateNode', function () {
      var barNode = new StateNode({ name: 'foo.bar' });
      var queueStub = sinon.stub(tree, '_queueLeaf');

      tree._registerNode(barNode);

      expect(queueStub.getCall(0).args[0]).to.equal(barNode);
    });


    it('should attach a node to $root and flush any children', function () {

      var fooNode = new StateNode({ name: 'foo' });
      var $root = tree._nodes[''];
      var flushStub = sinon.stub(tree, '_flushQueueOf');

      var attached = tree._registerNode(fooNode);

      expect(attached._parent).to.equal($root);
      expect(flushStub.calledOnce).to.equal(true);
      expect(flushStub).to.have.been.calledWithExactly(fooNode);
    });

  });


  describe('#_flushQueueOf(nodeName)', function () {

    beforeEach(function () {
      tree._nodes.foo = new StateNode({ name: 'foo' });
      sinon.spy(tree, '_registerNode');
    });


    it('should do nothing if the target queue does not exist', function () {

      tree._flushQueueOf('foo');

      expect(tree._registerNode.called).to.equal(false);
    });


    it('should register each child in target queue', function () {

      var fooNode = tree._nodes.foo;

      tree._leafQueue.foo = [
        new StateNode({ name: 'bar', parent: 'foo' }),
        new StateNode({ name: 'baz', parent: 'foo' }),
        new StateNode({ name: 'qux', parent: 'foo' })
      ];

      tree._flushQueueOf(fooNode);

      expect(tree._registerNode.calledThrice).to.equal(true);
    });


    it('should remove the target queue when flushed', function () {

      var fooNode = tree._nodes.foo;

      tree._leafQueue.foo = [
        new StateNode({ name: 'bar', parent: 'foo' }),
        new StateNode({ name: 'baz', parent: 'foo' }),
        new StateNode({ name: 'qux', parent: 'foo' })
      ];

      tree._flushQueueOf(fooNode);

      expect(tree._leafQueue.foo).to.equal(undefined);
    });

  });

  describe('End-to-end', function () {

    var tree, rootNode, fooNode, barNode, bazNode;

    beforeEach(function () {

      tree = new StateTree(StateNode);

      tree
        .attach('foo', {

        })

        .attach('bar.baz', {

        })

        .attach('bar', {

        });

      rootNode = tree._nodes[''];
      fooNode = tree._nodes.foo;
      barNode = tree._nodes.bar;
      bazNode = tree._nodes['bar.baz'];
    });


    it('should attach the nodes correctly', function () {

      expect(bazNode.getParentName()).to.equal('bar');

      expect(fooNode._parent).to.equal(rootNode);
      expect(barNode._parent).to.equal(rootNode);
      expect(bazNode._parent).to.equal(barNode);

      expect(fooNode.getBranch())
        .to.deep.equal([rootNode, fooNode]);
      expect(barNode.getBranch())
        .to.deep.equal([rootNode, barNode]);
      expect(bazNode.getBranch())
        .to.deep.equal([rootNode, barNode, bazNode]);

    });

  });

});
