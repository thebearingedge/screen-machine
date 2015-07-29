
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);


var View = require('../modules/View');


describe('View', function () {

  var viewTree, view;

  beforeEach(function () {

    viewTree = {
      activeViews: {},
      loadedViews: []
    };

    view = new View('', viewTree);
  });


  describe('.detach()', function () {

    it('should release its DOM reference', function () {

      view.domNode = {};

      view.detach();

      expect(view.domNode).to.equal(null);
    });

  });


  describe('.addComponent(stateName, component)', function () {

    it('should register a view for a state', function () {

      var component = { setView: sinon.spy() };

      view.addComponent('app', component);

      expect(view.components.app).to.equal(component);
      expect(component.setView).to.have.been.calledWithExactly(view);
    });

  });


  describe('.setParent(view)', function () {

    it('should take a reference to its parent', function () {

      var parent = {};

      view.setParent(parent);

      expect(view.parent).to.equal(parent);
    });

  });


  describe('.addChild(view)', function () {

    var child = new View(viewTree);

    it('should register a child view for a state', function () {

      view.addChild(child);

      expect(view.children[0]).to.equal(child);
    });

  });


  describe('.setContainer(view)', function () {

    it('should hold a reference to its containing view', function () {

      var container = {};

      view.setContainer(container);

      expect(view.container).to.equal(container);
    });

  });


  describe('.isShadowed()', function () {

    it('should know whether it will be visible or not', function () {

      var nextComponent = {};

      view.parent = { nextComponent: nextComponent };
      view.container = nextComponent;

      expect(view.isShadowed()).to.equal(false);

      view.parent = { nextComponent: null };

      expect(view.isShadowed()).to.equal(true);
    });

  });


  describe('.unload()', function () {

    it('should reset its next component and dequeue itself', function () {

      var unload = sinon.spy(View.prototype, 'unload');

      view.nextComponent = {};
      var child1 = new View('foo', viewTree);
      var child2 = new View('bar', viewTree);

      child1.nextComponent = {};
      view.children = [child1, child2];
      viewTree.loadedViews = [view, child1, child2];

      view.unload();

      expect(unload.calledThrice).to.equal(true);
      expect(view.nextComponent).to.equal(null);
      expect(child1.nextComponent).to.equal(null);
      expect(child2.nextComponent).to.equal(null);
      expect(viewTree.loadedViews).not.to.include(view, child1, child2);
    });

  });


  describe('.isActive()', function () {

    it('should know whether it is currently active', function () {

      viewTree.activeViews[''] = view;

      expect(view.isActive()).to.equal(true);

      viewTree.activeViews = {};

      expect(view.isActive()).to.equal(false);
    });

  });

});