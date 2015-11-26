
import jsdom from 'jsdom'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import customComponent from '../customComponent'

chai.use(sinonChai)

const { expect } = chai
const document = jsdom.jsdom()
const Component = customComponent(document)

describe('customComponent', () => {

  let viewController, node, factory

  beforeEach(() => {
    viewController = {
      update: sinon.spy(),
      destroy: sinon.spy()
    }
    node = document.createElement('div')
    factory = () => ({ viewController, node })
  })

  describe('constructor(componentName, viewKey, state)', () => {

    it('uses the factory defined on state.component', () => {
      const state = { component: factory }
      const component = new Component(null, null, state)
      expect(component.factory).to.equal(factory)
    })

    it('uses the factory defined on state.views', () => {
      const state = { views: { '@foo': { component: factory } } }
      const component = new Component(null, '@foo', state)
      expect(component.factory).to.equal(factory)
    })

  })

  describe('', () => {

    let component, state, resolved, params, query

    beforeEach(() => {
      state = { component: factory }
      resolved = {}
      params = {}
      query = {}
      component = new Component(null, null, state)
    })

    describe('render(resolved, params, query)', () => {

      it('calls factory and stores viewController and node', () => {
        const view = { attachWithin: sinon.spy() }
        component.addChildView(view)
        sinon.spy(component, 'factory')
        component.render(resolved, params, query)
        expect(component.factory).to.have.been
          .calledWithExactly(resolved, params, query, document)
        expect(view.attachWithin).to.have.been.calledWithExactly(node)
        expect(component.viewController).to.equal(viewController)
        expect(component.node).to.equal(node)
      })

    })

    describe('update(resolved, params, query)', () => {

      it('calls viewController.update with arguments', () => {
        component.render(resolved, params, query)
        component.update(resolved, params, query)
        expect(component.viewController.update).to.have.been
          .calledWithExactly(resolved, params, query)
      })

    })

    describe('destroy()', () => {

      it('destroys viewController, detaches children and nulls refs', () => {
        const view = { attachWithin: sinon.spy(), detach: sinon.spy() }
        component.addChildView(view)
        component.render(resolved, params, query)
        component.destroy()
        expect(viewController.destroy.called).to.equal(true)
        expect(view.detach.calledOnce).to.equal(true)
      })

    })

  })

})
