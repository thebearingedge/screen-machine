
'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { jsdom } from 'jsdom';
import riot from 'riot';
import State from '../modules/State';
import riotComponent from '../riotComponent';
import View from '../modules/View';

chai.use(sinonChai);

const { expect } = chai;
const document = jsdom();

require('./riot-tags/all');

describe('riotComponent', () => {

  let view, views;
  let RiotComponent, component;
  let state;

  beforeEach(() => {
    global.document = document;
    RiotComponent = riotComponent(riot)(document);
    views = { loadedViews: [], activeViews: [] };
    view = new View('@', views);
  });

  afterEach(() => global.document = undefined);

  it('should know its tagName', () => {
    state = new State({
      name: 'app',
      views: {
        '': { component: 'parent-tag' }
      }
    });
    component = new RiotComponent('', '', state);
    expect(component.tagName).to.equal('parent-tag');
  });

  beforeEach(() => {
    state = new State({
      name: 'app',
      component: 'simple-tag'
    });
    component = new RiotComponent('', '', state);
  });

  describe('.setView(view)', () => {

    it('should know which view it loads into', () => {
      component.setView(view);
      expect(component.view).to.equal(view);
    });

  });

  describe('.addChildView(view)', () => {

    it('should store child views', () => {
      component.addChildView(view);
      expect(component.childViews[0]).to.equal(view);
    });

  });

  describe('.load()', () => {

    it('should load into its view', () => {
      component.view = view;
      component.load();
      expect(view.nextComponent).to.equal(component);
    });

  });

  describe('.shouldRender()', () => {

    it('should know whether to render', () => {
      component.view = view;
      expect(component.shouldRender()).to.equal(false);
      component.load();
      expect(component.shouldRender()).to.equal(true);
    });

  });

  describe('.render()', () => {

    it('should render a riot tag', () => {
      state.$resolves = [{ id: 'place@app', key: 'place' }];
      component.render({ 'place@app': 'Santa Ana' });
      expect(component.node.innerHTML).to.equal(
        '<span>Welcome to Santa Ana</span>'
      );
    });

    it('should attach child views to rendered DOM', () => {
      state.component = 'parent-tag';
      view = new View('nested@', views);
      component = new RiotComponent('', '', state);
      component.addChildView(view);
      component.render();
      expect(view.element.outerHTML)
        .to.equal('<sm-view name="nested"></sm-view>');
    });

  });

  describe('.update(resolved)', () => {

    it('should update its node\'s content', () => {
      state.$resolves = [{ id: 'place@app', key: 'place' }];
      component.render({ 'place@app': '' });
      expect(component.node.innerHTML).to.equal(
        '<span>Welcome to </span>'
      );
      state.$resolves = [{ id: 'place@app', key: 'place' }];
      component.update({ 'place@app': 'Santa Ana' });
      expect(component.node.innerHTML).to.equal(
        '<span>Welcome to Santa Ana</span>'
      );
    });

  });

  describe('.destroy()', () => {

    it('should unmount its tag and release its dom node', () => {
      component.render();
      const { tagInstance, node } = component;
      sinon.spy(tagInstance, 'unmount');
      expect(node.innerHTML).to.equal('<span>Welcome to </span>');
      component.destroy();
      expect(tagInstance.unmount.calledOnce).to.equal(true);
      expect(component.node).to.equal(null);
      expect(component.tagInstance).to.equal(null);
    });

    it('should detach its child views', () => {
      state.component = 'parent-tag';
      state.$resolves = [{ id: '@app', key: '' }];
      view = new View('nested@', views);
      component = new RiotComponent('', '', state);
      component.addChildView(view);
      component.render({ '@app': null });
      sinon.spy(view, 'detach');
      component.destroy();
      expect(view.detach.calledOnce).to.equal(true);
    });

  });

});
