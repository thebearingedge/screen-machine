
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import Promise from 'native-promise-only'
import State from '../modules/State'
import SimpleResolve from '../modules/SimpleResolve'

chai.use(sinonChai)

const { expect } = chai

describe('SimpleResolve', () => {

  let state

  beforeEach(() => {
    state = new State({
      name: 'child',
      resolve: { bar: sinon.spy() }
    })
  })

  it('should have an invokable', () => {
    const resolve = new SimpleResolve('bar', state, Promise)
    expect(typeof resolve.invokable).to.equal('function')
    expect(resolve.invokable).to.equal(state.resolve.bar)
  })

  it('should call its invokable with arguments', () => {
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
