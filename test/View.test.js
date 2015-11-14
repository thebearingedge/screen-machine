
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var document = require('jsdom').jsdom();

import View from '../modules/View';


describe('View', function () {

  var viewTree, view;

  beforeEach(function () {

    viewTree = {
      activeViews: [],
      loadedViews: []
    };

    view = new View('@', viewTree);
  });


  afterEach(function () {

    document.body.innerHTML = '';
  });


  describe('attachWithin(node)', function () {

    it('should attach to unnamed <sm-view> tags', function () {

      document.body.innerHTML = '<div><sm-view><br></sm-view></div>';

      view.attachWithin(document.body);

      expect(view.element.innerHTML).to.equal('<br>');
    });


    it('should only attach to unnamed <sm-view> tags', function () {

      document.body
        .innerHTML = '<div><sm-view name="sidebar"><br></sm-view></div>';

      view.attachWithin(document.body);

      expect(view.element).to.equal(null);
    });


    it('should attach to named <sm-view> tags', function () {

      view = new View('sidebar@', viewTree);

      document.body
        .innerHTML = '<div><sm-view name="sidebar"><br></sm-view></div>';

      view.attachWithin(document.body);

      expect(view.element.innerHTML).to.equal('<br>');
    });

  });


  describe('.detach()', function () {

    it('should close and release its DOM reference', function () {

      view.element = {};

      view.detach();

      expect(view.element).to.equal(null);
    });

  });


  describe('.addComponent(stateName, component)', function () {

    it('should register a view for a state', function () {

      var component = { setView: sinon.spy() };

      view.addComponent('app', component);

      expect(view.components.app).to.equal(component);
    });

  });


  describe('.isLoaded()', function () {

    it('should know whether it is loaded', function () {

      expect(view.isLoaded()).to.equal(false);

      viewTree.loadedViews = [view];

      expect(view.isLoaded()).to.equal(true);
    });

  });


  describe('.isShadowed()', function () {

    it('should know whether it will be visible after page render', function () {

      expect(view.isShadowed()).to.equal(false);

      view.container = { view: {} };
      view.container.view.nextComponent = view.container;

      expect(view.isShadowed()).to.equal(false);

      view.container.view.nextComponent = null;

      expect(view.isShadowed()).to.equal(true);
    });

  });


  describe('.loadComponent()', function () {

    it('should register itself as loaded', function () {

      view.loadComponent({});

      expect(viewTree.loadedViews[0]).to.equal(view);
    });


    it('should not load more than one component', function () {

      var firstComponent = {};
      var secondComponent = {};

      view.loadComponent(firstComponent);
      view.loadComponent(secondComponent);

      expect(view.nextComponent).to.equal(firstComponent);
    });

  });


  describe('.unload()', function () {

    it('should deregister as a loaded view', function () {

      view.nextComponent = {};
      viewTree.loadedViews = [view];

      view.unload();

      expect(view.nextComponent).to.equal(null);
      expect(viewTree.loadedViews).not.to.include(view);
    });


    it('should unload its children', function () {

      var nextComponent = {};
      var childNextComponent = {};

      var child = new View('child', viewTree);

      view.nextComponent = nextComponent;
      view.children = [child];
      child.container = nextComponent;
      child.nextComponent = childNextComponent;
      viewTree.loadedViews = [view, child];

      view.unload();

      expect(viewTree.loadedViews).not.to.include(view, child);
      expect(view.nextComponent).to.equal(null);
      expect(child.nextComponent).to.equal(null);
    });

  });


  describe('.shouldClose()', function () {

    it('should close if it is not loaded', function () {

      expect(view.shouldClose()).to.equal(true);

      view.loadComponent({});

      expect(view.shouldClose()).to.equal(false);
    });

  });


  describe('.close()', function () {

    it('should remove its content from the DOM', function () {

      document.body.innerHTML = '<div><sm-view><br></sm-view></div>';

      view.attachWithin(document.body);

      expect(view.element.innerHTML).to.equal('<br>');

      view.close();

      expect(document.body.innerHTML)
        .to.equal('<div><sm-view></sm-view></div>');
    });


    it('should destroy its current component', function () {

      var component = { destroy: sinon.stub () };

      view.currentComponent = component;

      view.detach();

      expect(component.destroy.calledOnce).to.equal(true);
      expect(view.currentComponent).to.equal(null);
    });

  });


  describe('.shouldUpdate()', function () {

    it('should update if its next component is its current', function () {

      expect(view.shouldUpdate()).to.equal(false);

      var component = {};

      view.nextComponent = component;

      expect(view.shouldUpdate()).to.equal(false);

      view.currentComponent = component;

      expect(view.shouldUpdate()).to.equal(true);
    });

  });


  describe('.publish()', function () {

    beforeEach(function () {

      document.body.innerHTML = '<div><sm-view><br></sm-view></div>';
      view.attachWithin(document.body);
    });


    it('should know to update', function () {

      var content = view.content;
      var component = { update: sinon.stub(), render: sinon.stub() };
      view.currentComponent = component;
      view.nextComponent = component;

      view.publish();

      expect(document.body.innerHTML)
        .to.equal('<div><sm-view><br></sm-view></div>');
      expect(view.currentComponent).to.equal(component);
      expect(view.content).to.equal(content);
    });


    it('should replace its content', function () {

      var content = view.content;
      var component = {
        render: function () {
          this.node = document.createElement('p');
        }
      };

      view.loadComponent(component);
      component.render();
      view.publish();

      expect(document.body.innerHTML)
        .to.equal('<div><sm-view><p></p></sm-view></div>');
      expect(view.content).not.to.equal(content);
    });


    it('should append new content', function () {

      document.body.innerHTML = '<div><sm-view></sm-view></div>';
      view.attachWithin(document.body);

      var component = {
        render: function () {
          this.node = document.createElement('p');
        }
      };

      view.loadComponent(component);
      component.render();

      expect(view.content).to.equal(null);

      view.publish();

      expect(document.body.innerHTML)
        .to.equal('<div><sm-view><p></p></sm-view></div>');
      expect(view.content).not.to.equal(null);
    });

  });

});