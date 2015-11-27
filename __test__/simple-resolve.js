
import { expect, spy } from '@thebearingedge/test-utils'
import Promise from 'native-promise-only'
import State from '../src/state'
import SimpleResolve from '../src/simple-resolve'

describe('SimpleResolve', () => {

  let state

  beforeEach(() => {
    state = new State({
      name: 'child',
      resolve: { bar: spy() }
    })
  })

  it('has an invokable', () => {
    const resolve = new SimpleResolve('bar', state, Promise)
    expect(typeof resolve.invokable).to.equal('function')
    expect(resolve.invokable).to.equal(state.resolve.bar)
  })

  it('calls its invokable with arguments', () => {
    const params = {}
    const query = {}
    const transition = {}
    const resolve = new SimpleResolve('bar', state, Promise)
    resolve.execute(params, query, transition)
    expect(resolve.invokable)
      .to.have.been
      .calledWithExactly(params, query, transition)
  })

})
