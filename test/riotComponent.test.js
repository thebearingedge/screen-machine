
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var State = require('../modules/State');
var riotComponent = require('../riotComponent');
var View = require('../modules/View');
var document = require('jsdom').jsdom();
var riot = require('riot');

require('./riot-tags/all');


describe('riotComponent', function () {

  var view, views;
  var RiotComponent, component;
  var state;

  beforeEach(function () {

    global.document = document;

    RiotComponent = riotComponent(riot)(document);

    views = {
      loadedViews: [],
      activeViews: []
    };

    view = new View('@', views);
  });


  afterEach(function () {

    global.document = undefined;
  });


  it('should know its tagName', function () {

    state = new State({
      name: 'app',
      views: {
        '': {
          component: 'parent-tag'
        }
      }
    });
    component = new RiotComponent('', '', state);

    expect(component.tagName).to.equal('parent-tag');
  });


  beforeEach(function () {

    state = new State({
      name: 'app',
      component: 'simple-tag'
    });
    component = new RiotComponent('', '', state);
  });


  describe('.setView(view)', function () {

    it('should know which view it loads into', function () {

      component.setView(view);

      expect(component.view).to.equal(view);
    });

  });


  describe('.addChildView(view)', function () {

    it('should store child views', function () {

      component.addChildView(view);

      expect(component.childViews[0]).to.equal(view);
    });

  });


  describe('.load()', function () {

    it('should load into its view', function () {

      component.view = view;

      component.load();

      expect(view.nextComponent).to.equal(component);
    });

  });


  describe('.shouldRender()', function () {

    it('should know whether to render', function () {

      component.view = view;

      expect(component.shouldRender()).to.equal(false);

      component.load();

      expect(component.shouldRender()).to.equal(true);

      view.currentComponent = component;

      expect(component.shouldRender()).to.equal(false);
    });

  });


  describe('.render()', function () {

    it('should render a riot tag', function () {

      state.getResolveResults = function () { return { place: 'Santa Ana' }; };

      component.render();

      expect(component.node.innerHTML).to.equal(
        '<span>Welcome to Santa Ana</span>'
      );
      expect(component.tagInstance.root).to.equal(component.node);
    });


    it('should attach child views to rendered DOM', function () {

      var dump = document.createElement('div');

      state.component = 'parent-tag';
      state.getResolveResults = function () { return {}; };

      view = new View('nested@', views);
      component = new RiotComponent('', '', state);
      component.addChildView(view);

      component.render();

      dump.appendChild(view.element);

      expect(dump.innerHTML).to.equal('<sm-view name="nested"></sm-view>');
    });

  });


  describe('.update()', function () {

    it('should update its node\'s content', function () {

      state.getResolveResults = function () { return { place: '' }; };

      component.render();

      expect(component.node.innerHTML).to.equal(
        '<span>Welcome to </span>'
      );

      state.getResolveResults = function () { return { place: 'Santa Ana' }; };

      component.update();

      expect(component.node.innerHTML).to.equal(
        '<span>Welcome to Santa Ana</span>'
      );
    });

  });


  describe('.destroy()', function () {

    it('should unmount its tag and release its dom node', function () {

      state.getResolveResults = function () { return { place: '' }; };

      component.render();

      sinon.spy(component.tagInstance, 'unmount');

      var tag = component.tagInstance;

      expect(component.node.innerHTML).to.equal(
        '<span>Welcome to </span>'
      );

      component.destroy();

      expect(tag.unmount.calledOnce).to.equal(true);
      expect(component.node).to.equal(null);
      expect(component.tagInstance).to.equal(null);
    });


    it('should detach its child views', function () {

      state.component = 'parent-tag';
      state.getResolveResults = function () { return {}; };

      view = new View('nested@', views);
      component = new RiotComponent('', '', state);
      component.addChildView(view);

      component.render();

      sinon.spy(view, 'detach');

      component.destroy();

      expect(view.detach.calledOnce).to.equal(true);
    });

  });


});