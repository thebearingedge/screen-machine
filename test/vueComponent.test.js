
import path from 'path'
import glob from 'glob'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { jsdom } from 'jsdom'
import State from '../modules/State'
import vueComponent from '../vueComponent'
import View from '../modules/View'

chai.use(sinonChai)

const vueDir = path.join(__dirname, '../node_modules/vue/src')
const vueFiles = glob.sync(vueDir + '/**/*.js')
const { expect } = chai

describe('vueComponent', () => {

  let Vue
  let VueComponent
  let views
  let view
  let state
  let component

  before(() => {
    vueFiles.forEach(file => delete require.cache[file])
    global.document = jsdom()
    global.window = global.document.defaultView
    global.DocumentFragment = global.window.DocumentFragment
    global.navigator = { userAgent: 'node.js' }
    Vue = require('vue')
    Vue.config.async = false
    require('./vues')(Vue)
    VueComponent = vueComponent(Vue)(document)
  })

  after(() => {
    global.document = global.DocumentFragment = global.window = undefined
  })

  beforeEach(() => {
    views = { loadedViews: [], activeViews: [] }
    view = new View('@', views)
  })

  it('should know its ViewModel', () => {
    state = new State({
      name: 'app',
      views: { '': { component: 'ParentVue' } }
    })
    component = new VueComponent('', '', state)
    const ViewModel = component.ViewModel
    expect(ViewModel).to.exist
    expect(ViewModel).to.equal(Vue.component('ParentVue'))
  })

  describe('', () => {

    beforeEach(() => {
      state = new State({
        name: 'app',
        component: 'SimpleVue'
      })
      component = new VueComponent('', '', state)
    })

    describe('.setView(view)', () => {

      it('should know which view it loads into', () => {
        component.setView(view)
        expect(component.view).to.equal(view)
      })

    })

    describe('.addChildView(view)', () => {

      it('should store child views', () => {
        component.addChildView(view)
        expect(component.childViews[0]).to.equal(view)
      })

    })

    describe('.load()', () => {

      it('should load into its view', () => {
        component.view = view
        component.load()
        expect(view.nextComponent).to.equal(component)
      })

    })

    describe('.shouldRender()', () => {

      it('should know whether to render', () => {
        component.view = view
        expect(component.shouldRender()).to.equal(false)
        component.load()
        expect(component.shouldRender()).to.equal(true)
      })

    })

    describe('.render()', () => {

      it('should render a riot tag', () => {
        state.$resolves = [{ id: 'place@app', key: 'place' }]
        component.render({ 'place@app': 'Santa Ana' })
        expect(component.node.outerHTML).to.equal(
          '<span>Welcome to Santa Ana</span>'
        )
      })

      it('should attach child views to rendered DOM', () => {
        state.component = 'ParentVue'
        view = new View('nested@', views)
        component = new VueComponent('', '', state)
        component.addChildView(view)
        component.render()
        expect(view.element.outerHTML)
          .to.equal('<sm-view name="nested"></sm-view>')
      })

    })

    describe('.update(resolved)', () => {

      it('should update its node\'s content', () => {
        state.$resolves = [{ id: 'place@app', key: 'place' }]
        component.render({ 'place@app': '' })
        expect(component.node.outerHTML).to.equal(
          '<span>Welcome to </span>'
        )
        state.$resolves = [{ id: 'place@app', key: 'place' }]
        component.update({ 'place@app': 'Santa Ana' })
        expect(component.node.outerHTML).to.equal(
          '<span>Welcome to Santa Ana</span>'
        )
      })

    })

    describe('.destroy()', () => {

      it('should destory its vm and release its dom node', () => {
        component.render()
        sinon.spy(component.vm, '$destroy')
        const vm = component.vm
        expect(component.node.outerHTML).to.equal(
          '<span>Welcome to </span>'
        )
        component.destroy()
        expect(vm.$destroy.calledOnce).to.equal(true)
        expect(component.node).to.equal(null)
        expect(component.vm).to.equal(null)
      })

      it('should detach its child views', () => {
        state.component = 'ParentVue'
        state.$resolves = [{ id: '@app', key: '' }]
        view = new View('nested@', views)
        component = new VueComponent('', '', state)
        component.addChildView(view)
        component.render({ '@app': null })
        sinon.spy(view, 'detach')
        component.destroy()
        expect(view.detach.calledOnce).to.equal(true)
      })

    })

  })

})
