
import { expect, spy } from '@thebearingedge/test-utils'
import { jsdom } from 'jsdom'
import riot from 'riot'
import State from '../src/state'
import riotComponent from '../src/riot-component'
import View from '../src/view'

const document = jsdom()

global.riot = riot
require('./riot-tags')

describe('riotComponent', () => {

  let view, views
  let RiotComponent, component
  let state

  beforeEach(() => {
    global.document = document
    RiotComponent = riotComponent(riot)(document)
    views = { loadedViews: [], activeViews: [] }
    view = new View('@', views)
  })

  afterEach(() => global.document = undefined)

  it('should know its tagName', () => {
    state = new State({
      name: 'app',
      views: {
        '': { component: 'parent-tag' }
      }
    })
    component = new RiotComponent('', '', state)
    expect(component.tagName).to.equal('parent-tag')
  })

  beforeEach(() => {
    state = new State({
      name: 'app',
      component: 'simple-tag'
    })
    component = new RiotComponent('', '', state)
  })

  describe('setView(view)', () => {

    it('should know which view it loads into', () => {
      component.setView(view)
      expect(component.view).to.equal(view)
    })

  })

  describe('addChildView(view)', () => {

    it('should store child views', () => {
      component.addChildView(view)
      expect(component.childViews[0]).to.equal(view)
    })

  })

  describe('load()', () => {

    it('should load into its view', () => {
      component.view = view
      component.load()
      expect(view.nextComponent).to.equal(component)
    })

  })

  describe('shouldRender()', () => {

    it('should know whether to render', () => {
      component.view = view
      expect(component.shouldRender()).to.equal(false)
      component.load()
      expect(component.shouldRender()).to.equal(true)
    })

  })

  describe('render()', () => {

    it('should render a riot tag', () => {
      state.$resolves = [{ id: 'place@app', key: 'place' }]
      component.render({ 'place@app': 'Santa Ana' })
      expect(component.node.innerHTML).to.equal(
        '<span>Welcome to Santa Ana</span>'
      )
    })

    it('should attach child views to rendered DOM', () => {
      state.component = 'parent-tag'
      view = new View('nested@', views)
      component = new RiotComponent('', '', state)
      component.addChildView(view)
      component.render()
      expect(view.element.outerHTML)
        .to.equal('<sm-view name="nested"></sm-view>')
    })

  })

  describe('update(resolved)', () => {

    it('should update its node\'s content', () => {
      state.$resolves = [{ id: 'place@app', key: 'place' }]
      component.render({ 'place@app': '' })
      expect(component.node.innerHTML).to.equal(
        '<span>Welcome to </span>'
      )
      state.$resolves = [{ id: 'place@app', key: 'place' }]
      component.update({ 'place@app': 'Santa Ana' })
      expect(component.node.innerHTML).to.equal(
        '<span>Welcome to Santa Ana</span>'
      )
    })

  })

  describe('destroy()', () => {

    it('should unmount its tag and release its dom node', () => {
      component.render()
      const { tagInstance, node } = component
      expect(node.innerHTML).to.equal('<span>Welcome to </span>')
      component.destroy()
      expect(tagInstance.isMounted).to.equal(false)
      expect(component.node).to.equal(null)
      expect(component.tagInstance).to.equal(null)
    })

    it('should detach its child views', () => {
      state.component = 'parent-tag'
      state.$resolves = [{ id: '@app', key: '' }]
      view = new View('nested@', views)
      component = new RiotComponent('', '', state)
      component.addChildView(view)
      component.render({ '@app': null })
      spy(view, 'detach')
      component.destroy()
      expect(view.detach.calledOnce).to.equal(true)
    })

  })

})
