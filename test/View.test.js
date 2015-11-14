
'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { jsdom } from 'jsdom';
import View from '../modules/View';

chai.use(sinonChai);

const { expect } = chai;
const document = jsdom();

describe('View', () => {

  let viewTree, view;

  beforeEach(() => {
    viewTree = { activeViews: [], loadedViews: [] };
    view = new View('@', viewTree);
  });

  afterEach(() => document.body.innerHTML = '');

  describe('attachWithin(node)', () => {

    it('should attach to unnamed <sm-view> tags', () => {
      document.body.innerHTML = '<div><sm-view><br></sm-view></div>';
      view.attachWithin(document.body);
      expect(view.element.innerHTML).to.equal('<br>');
    });

    it('should only attach to unnamed <sm-view> tags', () => {
      const html = '<div><sm-view name="sidebar"><br></sm-view></div>';
      document.body.innerHTML = html;
      view.attachWithin(document.body);
      expect(view.element).to.equal(null);
    });

    it('should attach to named <sm-view> tags', () => {
      view = new View('sidebar@', viewTree);
      const html = '<div><sm-view name="sidebar"><br></sm-view></div>';
      document.body.innerHTML = html;
      view.attachWithin(document.body);
      expect(view.element.innerHTML).to.equal('<br>');
    });

  });

  describe('.detach()', () => {

    it('should close and release its DOM reference', () => {
      view.element = {};
      view.detach();
      expect(view.element).to.equal(null);
    });

  });

  describe('.addComponent(stateName, component)', () => {

    it('should register a view for a state', () => {
      const component = { setView: sinon.spy() };
      view.addComponent('app', component);
      expect(view.components.app).to.equal(component);
    });

  });

  describe('.isLoaded()', () => {

    it('should know whether it is loaded', () => {
      expect(view.isLoaded()).to.equal(false);
      viewTree.loadedViews = [view];
      expect(view.isLoaded()).to.equal(true);
    });

  });

  describe('.isShadowed()', () => {

    it('should know whether it will be visible after page render', () => {
      expect(view.isShadowed()).to.equal(false);
      view.container = { view: {} };
      view.container.view.nextComponent = view.container;
      expect(view.isShadowed()).to.equal(false);
      view.container.view.nextComponent = null;
      expect(view.isShadowed()).to.equal(true);
    });

  });

  describe('.loadComponent()', () => {

    it('should register itself as loaded', () => {
      view.loadComponent({});
      expect(viewTree.loadedViews[0]).to.equal(view);
    });

    it('should not load more than one component', () => {
      const firstComponent = {};
      const secondComponent = {};
      view.loadComponent(firstComponent);
      view.loadComponent(secondComponent);
      expect(view.nextComponent).to.equal(firstComponent);
    });

  });

  describe('.unload()', () => {

    it('should deregister as a loaded view', () => {
      view.nextComponent = {};
      viewTree.loadedViews = [view];
      view.unload();
      expect(view.nextComponent).to.equal(null);
      expect(viewTree.loadedViews).not.to.include(view);
    });

    it('should unload its children', () => {
      const nextComponent = {};
      const childNextComponent = {};
      const child = new View('child', viewTree);
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

  describe('.shouldClose()', () => {

    it('should close if it is not loaded', () => {
      expect(view.shouldClose()).to.equal(true);
      view.loadComponent({});
      expect(view.shouldClose()).to.equal(false);
    });

  });

  describe('.close()', () => {

    it('should remove its content from the DOM', () => {
      document.body.innerHTML = '<div><sm-view><br></sm-view></div>';
      view.attachWithin(document.body);
      expect(view.element.innerHTML).to.equal('<br>');
      view.close();
      expect(document.body.innerHTML)
        .to.equal('<div><sm-view></sm-view></div>');
    });

    it('should destroy its current component', () => {
      const component = { destroy: sinon.stub () };
      view.currentComponent = component;
      view.detach();
      expect(component.destroy.calledOnce).to.equal(true);
      expect(view.currentComponent).to.equal(null);
    });

  });

  describe('.shouldUpdate()', () => {

    it('should update if its next component is its current', () => {
      expect(view.shouldUpdate()).to.equal(false);
      const component = {};
      view.nextComponent = component;
      expect(view.shouldUpdate()).to.equal(false);
      view.currentComponent = component;
      expect(view.shouldUpdate()).to.equal(true);
    });

  });

  describe('.publish()', () => {

    beforeEach(() => {
      document.body.innerHTML = '<div><sm-view><br></sm-view></div>';
      view.attachWithin(document.body);
    });

    it('should know to update', () => {
      const content = view.content;
      const component = { update: sinon.stub(), render: sinon.stub() };
      view.currentComponent = component;
      view.nextComponent = component;
      view.publish();
      expect(document.body.innerHTML)
        .to.equal('<div><sm-view><br></sm-view></div>');
      expect(view.currentComponent).to.equal(component);
      expect(view.content).to.equal(content);
    });

    it('should replace its content', () => {
      const content = view.content;
      const component = {
        render() {
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

    it('should append new content', () => {
      document.body.innerHTML = '<div><sm-view></sm-view></div>';
      view.attachWithin(document.body);
      const component = {
        render() {
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
