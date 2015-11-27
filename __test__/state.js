
import { expect, spy } from '@thebearingedge/test-utils'
import State from '../src/state'

describe('State', () => {

  let state

  it('should know its parent name', () => {

    state = new State({ name: 'foo' })
    expect(state.parent).to.equal(null)

    state = new State({ name: 'foo.bar' })
    expect(state.parent).to.equal('foo')

    state = new State({ name: 'foo.bar.baz' })
    expect(state.parent).to.equal('foo.bar')

    state = new State({ name: 'bar', parent: 'foo' })
    expect(state.parent).to.equal('foo')
  })


  it('should break its path into segments', () => {

    state = new State({ name: 'foo', path: '/foo-path' })
    expect(state.$queryKeys).to.deep.equal([])

    state = new State({ name: 'foo', path: 'foo-path' })
    expect(state.$queryKeys).to.deep.equal([])

    state = new State({ name: 'bar', path: '/foo-path/:barParam' })
    expect(state.$paramKeys).to.deep.equal(['barParam'])
    expect(state.$queryKeys).to.deep.equal([])

    state = new State({ name: 'baz', path: '/baz-path?qux&quux' })
    expect(state.$queryKeys).to.deep.equal(['qux', 'quux'])


    state = new State({ name: 'qux', path: '/' })
    expect(state.$queryKeys).to.deep.equal([])
  })

  beforeEach(() => state = new State({ name: 'foo' }))

  describe('.contains(state)', () => {

    it('should know whether it contains another state', () => {
      expect(state.contains(state)).to.equal(true)
      expect(state.contains({ name: 'baz' })).to.equal(false)
    })

  })

  describe('.getBranch()', () => {

    it('should retreive its ancestor States', () => {
      expect(state.getBranch()[0]).to.equal(state)
    })

  })

  describe('.addView(view)', () => {

    it('should store views', () => {
      expect(state.$views).to.equal(null)
      state.addView({})
      expect(state.$views).to.deep.equal([{}])
    })

  })

  describe('.getViews()', () => {

    it('should return its views', () => {
      expect(state.getViews()).to.deep.equal([])
      const view = {}
      state.$views = [view]
      expect(state.getViews()[0]).to.equal(view)
    })

  })

  describe('.addComponent(component)', () => {

    it('should store views', () => {
      expect(state.$components).to.equal(null)
      state.addComponent({})
      expect(state.$components).to.deep.equal([{}])
    })

  })

  describe('.getComponents()', () => {

    it('should return its views', () => {
      expect(state.getComponents()).to.deep.equal([])
      const component = {}
      state.$components = [component]
      expect(state.getComponents()[0]).to.equal(component)
    })

  })

  describe('.getParent()', () => {

    it('should return its parent State', () => {
      const fakeParent = {}
      state.$parent = fakeParent
      expect(state.getParent()).to.equal(fakeParent)
    })

  })

  describe('.getAncestor(stateName)', () => {

    it('should return an ancestor state', () => {
      const foo = new State({ name: 'foo' })
      const bar = new State({ name: 'bar' })
      bar.inheritFrom(foo)
      expect(bar.getAncestor('foo')).to.equal(foo)
    })

  })

  describe('.addResolve(resolve)', () => {

    it('should store resolves', () => {
      expect(state.$resolves).to.equal(null)
      const fakeResolve = {}
      state.addResolve(fakeResolve)
      expect(state.$resolves).to.exist
      expect(state.$resolves.length).to.equal(1)
    })

  })

  describe('.getResolves()', () => {

    it('should return its resolves', () => {
      expect(state.getResolves()).to.deep.equal([])
      const fakeResolve = {}
      state.$resolves = [fakeResolve]
      expect(state.getResolves()[0]).to.equal(fakeResolve)
    })

  })

  describe('.filterParams(Object params)', () => {

    it('should return params filtered by $paramKeys', () => {
      state.$paramKeys = ['foo', 'bar']
      const allParams = { foo: 1, bar: 2, baz: 3 }
      expect(state.filterParams(allParams)).to.deep.equal({ foo: 1, bar: 2 })
    })

  })

  describe('.sleep()', () => {

    it('should reset views, resolves and $paramCache', () => {

      const view = { detach: spy() }
      const resolve = { clear: spy() }

      state.$views = [view]
      state.$resolves = [resolve]

      state.sleep()

      expect(view.detach.calledOnce).to.equal(true)
      expect(resolve.clear.calledOnce).to.equal(true)
    })

  })

  describe('.isStale(oldParams, newParams, oldQuery, newQuery)', () => {

    it('should be false if relevent params are equal', () => {
      const oldParams = {}
      const newParams = {}
      const oldQuery = {}
      const newQuery = {}
      expect(state.isStale(oldParams, newParams, oldQuery, newQuery))
        .to.equal(false)
    })

    it('should be true if relevant params have changed', () => {

      let oldParams = { foo: 1 }
      let newParams = { foo: 2 }
      let oldQuery = { bar: 1 }
      let newQuery = { bar: 1 }

      state.$paramKeys = ['foo']
      state.$queryKeys = []

      expect(state.isStale(oldParams, newParams, oldQuery, newQuery))
        .to.equal(true)

      oldParams = { foo: 1 }
      newParams = { foo: 1 }
      oldQuery = { bar: 1 }
      newQuery = { bar: 2 }

      state.$paramKeys = []
      state.$queryKeys = ['bar']

      expect(state.isStale(oldParams, newParams, oldQuery, newQuery))
        .to.equal(true)
    })

  })

  describe('.shouldResolve(cache)', () => {

    it('should resolve if it has resolves and is not cacheable', () => {
      const cache = { $store: {} }
      state = new State({ name: 'state', cacheable: false })
      state.$resolves = []
      expect(state.shouldResolve(cache)).to.equal(true)
    })

  })

  describe('.inheritFrom(Object state)', () => {

    let foo, bar

    beforeEach(() => {

      foo = new State({
        name: 'foo',
        path: '/',
        data: { isCool: true }
      })

      foo.$paramKeys = ['baz']

      bar = new State({
        name: 'bar',
        path: '/bar',
        data: { isGood: true }
      })
    })

    it('should extend parent state properties', () => {
      bar.inheritFrom(foo)
      expect(bar.data).to.deep.equal({ isCool: true, isGood: true })
      expect(bar.$includes.foo).to.equal(true)
      expect(bar.$paramKeys.length).to.equal(1)
      expect(bar.$paramKeys).to.include('baz', 'qux')
      expect(bar.$branch[0]).to.equal(foo)
      expect(bar.$parent).to.equal(foo)
    })

    it('should always extend parent data', () => {
      bar.data = null
      bar.inheritFrom(foo)
      expect(bar.data).to.deep.equal(foo.data)
    })

  })

})
