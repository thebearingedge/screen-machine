
'use strict';

const path = require('path');
const glob = require('glob');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var State = require('../modules/State');
var vueComponent = require('../vueComponent');
var View = require('../modules/View');
var jsdom = require('jsdom').jsdom;

const vueDir = path.join(__dirname, '../node_modules/vue/src');
const vueFiles = glob.sync(vueDir + '/**/*.js');

describe('vueComponent', () => {

  let Vue;
  let VueComponent;
  let views;
  let view;
  let state;
  let component;

  before(() => {
    vueFiles.forEach(file => delete require.cache[file]);
    global.document = jsdom();
    global.window = global.document.defaultView;
    global.DocumentFragment = global.window.DocumentFragment;
    global.navigator = { userAgent: 'node.js' };
    Vue = require('vue');
    Vue.config.async = false;
    require('./vues')(Vue);
    VueComponent = vueComponent(Vue)(document);
  });

  after(() => {
    global.document = global.DocumentFragment = global.window = undefined;
  });

  beforeEach(() => {
    views = {
      loadedViews: [],
      activeViews: []
    };
    view = new View('@', views);
  });

  it('', () => expect(true).to.equal(true));


  it('should know its ViewModel', () => {

    state = new State({
      name: 'app',
      views: {
        '': {
          component: 'ParentVue'
        }
      }
    });
    component = new VueComponent('', '', state);
    const ViewModel = component.ViewModel;
    expect(ViewModel).to.exist;
    expect(ViewModel).to.equal(Vue.component('ParentVue'));
  });

  describe('', () => {

    beforeEach(function () {
      state = new State({
        name: 'app',
        component: 'SimpleVue'
      });
      component = new VueComponent('', '', state);
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
      });

    });

    describe('.render()', function () {

      it('should render a riot tag', function () {
        state.$resolves = [{ id: 'place@app', key: 'place' }];
        component.render({ 'place@app': 'Santa Ana' });
        expect(component.node.outerHTML).to.equal(
          '<span>Welcome to Santa Ana</span>'
        );
      });


      it('should attach child views to rendered DOM', function () {
        state.component = 'ParentVue';
        view = new View('nested@', views);
        component = new VueComponent('', '', state);
        component.addChildView(view);
        component.render();
        expect(view.element.outerHTML)
          .to.equal('<sm-view name="nested"></sm-view>');
      });

    });

    describe('.update(resolved)', function () {

      it('should update its node\'s content', function () {
        state.$resolves = [{ id: 'place@app', key: 'place' }];
        component.render({ 'place@app': '' });
        expect(component.node.outerHTML).to.equal(
          '<span>Welcome to </span>'
        );
        state.$resolves = [{ id: 'place@app', key: 'place' }];
        component.update({ 'place@app': 'Santa Ana' });
        expect(component.node.outerHTML).to.equal(
          '<span>Welcome to Santa Ana</span>'
        );
      });

    });


    describe('.destroy()', function () {

      it('should destory its vm and release its dom node', function () {
        component.render();
        sinon.spy(component.vm, '$destroy');
        var vm = component.vm;
        expect(component.node.outerHTML).to.equal(
          '<span>Welcome to </span>'
        );
        component.destroy();
        expect(vm.$destroy.calledOnce).to.equal(true);
        expect(component.node).to.equal(null);
        expect(component.vm).to.equal(null);
      });


      it('should detach its child views', function () {
        state.component = 'ParentVue';
        state.$resolves = [{ id: '@app', key: '' }];
        view = new View('nested@', views);
        component = new VueComponent('', '', state);
        component.addChildView(view);
        component.render({ '@app': null });
        sinon.spy(view, 'detach');
        component.destroy();
        expect(view.detach.calledOnce).to.equal(true);
      });

    });


  });


});