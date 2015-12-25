
import { expect, spy } from '@thebearingedge/test-utils'
import jsdom from 'jsdom'
import State from '../src/state'
import customComponent from '../src/custom-component'

const document = jsdom.jsdom()
const Component = customComponent(document)

describe('customComponent', () => {

  let controller, node, factory

  beforeEach(() => {
    controller = {
      update: spy(),
      destroy: spy()
    }
    node = document.createElement('div')
    factory = () => ({ controller, node })
  })

  describe('constructor(componentName, viewKey, state)', () => {

    it('uses the factory defined on state.component', () => {
      const state = new State({ name: 'test', component: factory })
      const component = new Component(null, null, state)
      expect(component.factory).to.equal(factory)
    })

    it('uses the factory defined on state.views', () => {
      const state = new State({ name: 'test', views: { '@foo': { component: factory } } })
      const component = new Component(null, '@foo', state)
      expect(component.factory).to.equal(factory)
    })

  })

  describe('', () => {

    let component, state, resolved, params, query

    beforeEach(() => {
      state = new State({ name: 'test', component: factory })
      resolved = {}
      params = {}
      query = {}
      component = new Component(null, null, state)
    })

    describe('render(resolved, params, query)', () => {

      it('calls factory and stores controller and node', () => {
        const view = { attachWithin: spy() }
        component.addChildView(view)
        spy(component, 'factory')
        component.render(resolved, params, query)
        expect(component.factory).to.have.been
          .calledWithExactly({ params, query }, document)
        expect(view.attachWithin).to.have.been.calledWithExactly(node)
        expect(component.controller).to.equal(controller)
        expect(component.node).to.equal(node)
      })

    })

    describe('update(resolved, params, query)', () => {

      it('calls controller.update with arguments', () => {
        component.render(resolved, params, query)
        component.update(resolved, params, query)
        expect(component.controller.update).to.have.been
          .calledWithExactly({ params, query })
      })

    })

    describe('destroy()', () => {

      it('destroys controller, detaches children and nulls refs', () => {
        const view = { attachWithin: spy(), detach: spy() }
        component.addChildView(view)
        component.render(resolved, params, query)
        component.destroy()
        expect(controller.destroy.called).to.equal(true)
        expect(view.detach.calledOnce).to.equal(true)
      })

    })

  })

})
