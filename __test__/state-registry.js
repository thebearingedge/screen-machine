
import chai from 'chai'
import sinonChai from 'sinon-chai'
import stateRegistry from '../src/state-registry'
import State from '../src/state'

chai.use(sinonChai)

const { expect } = chai

describe('stateRegistry', () => {

  let registry, $root

  beforeEach(() => {
    registry = stateRegistry()
    $root = registry.$root
  })

  describe('.add(String stateName, Object definition) -> this', () => {

    it('should create and register a State', () => {
      registry.add('foo', {})
      const fooState = registry.states.foo
      expect(fooState instanceof State).to.equal(true)
      expect(fooState.$parent).to.equal($root)
    })

    it('should accept an object definition with a name property', () => {
      registry.add({ name: 'foo' })
      const fooState = registry.states.foo
      expect(fooState instanceof State).to.equal(true)
      expect(fooState.$parent).to.equal($root)
    })

    it('should enqueue a state with a lazy parent', () => {
      registry.add('foo.bar', {})
      const barState = registry.queues.foo[0]
      expect(barState.$parent).to.equal(null)
      expect(registry.states['foo.bar']).to.equal(undefined)
      expect(barState instanceof State).to.equal(true)
    })

    it('should throw if state name is invalid', () => {
      expect(() => registry.add({}))
        .to.throw(Error, 'State definitions must include a string name')
    })

    it('should dequeue states that were queued', () => {

      registry.add('foo.bar', {})
      registry.add('foo.bar.baz', {})

      const barState = registry.queues.foo[0]
      const bazState = registry.queues['foo.bar'][0]

      expect(barState.$parent).to.equal(null)
      expect(bazState.$parent).to.equal(null)

      registry.add('foo', {})

      const fooState = registry.states.foo

      expect(registry.queues.foo.length).to.equal(0)
      expect(registry.queues['foo.bar'].length).to.equal(0)
      expect(registry.states['foo.bar']).to.equal(barState)
      expect(registry.states['foo.bar.baz']).to.equal(bazState)
      expect(barState.$parent).to.equal(fooState)
      expect(bazState.$parent).to.equal(barState)
    })

  })

})
