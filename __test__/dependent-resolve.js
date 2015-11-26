
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'
import Promise from 'native-promise-only'
import State from '../src/state'
import DependentResolve from '../src/dependent-resolve'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const { expect } = chai

describe('DependentResolve', () => {

  let state

  beforeEach(() => {
    state = new State({
      name: 'child',
      resolve: {
        bar: () => {},
        baz: ['foo@parent', 'bar', sinon.spy()]
      }
    })
  })

  it('should have an invokable and list of injectables', () => {
    const resolve = new DependentResolve('baz', state, Promise)
    expect(resolve.injectables).to.deep.equal(['foo@parent', 'bar@child'])
    expect(typeof resolve.invokable).to.equal('function')
    expect(resolve.invokable).to.equal(state.resolve.baz[2])
  })

  it('should call its invokable with dependencies', () => {
    const params = {}
    const query = {}
    const transition = {}
    const dependencies = { 'foo@parent': 'krünk', 'bar@child': 'pöpli' }
    const resolve = new DependentResolve('baz', state, Promise)
    resolve.execute(params, query, transition, dependencies)
    expect(resolve.invokable)
      .to.have.been
      .calledWithExactly('krünk', 'pöpli', params, query, transition)
  })

})
