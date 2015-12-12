
import { expect, spy, stub } from '@thebearingedge/test-utils'
import Promise from 'native-promise-only'
import eventBus from '../src/event-bus'
import resolveFactory from '../src/resolve-factory'
import stateRegistry from '../src/state-registry'
import stateMachine from '../src/state-machine'

describe('stateMachine', () => {

  let resolves, registry, events, machine
  let rootState, appState, fooState, barState, bazState, quxState, quuxState
  let initialParams, initialQuery

  beforeEach(() => {

    events = eventBus({
      emitter: { emit: () => {} },
      trigger: 'emit'
    })

    resolves = resolveFactory(Promise)
    registry = stateRegistry()
    machine = stateMachine(events, registry, Promise)

    rootState = registry.$root
    rootState.beforeEnter = spy()
    rootState.beforeUpdate = spy()
    rootState.beforeExit = spy()

    initialParams = {}
    initialQuery = {}

    const states = [
      appState = registry
        .add('app', {
          path: '/',
          beforeExit: spy(),
          beforeUpdate: spy(),
          beforeEnter: spy()
        }),
      fooState = registry
        .add('app.foo', {
          path: 'foo/:fooParam',
          resolve: {
            fooResolve: spy()
          },
          beforeExit: spy(),
          beforeUpdate: spy(),
          beforeEnter: spy()
        }),
      barState = registry
        .add('app.foo.bar', {
          path: 'bar?barQuery',
          resolve: {
            barResolve: spy(params => params.fooParam)
          },
          beforeExit: spy(),
          beforeUpdate: spy(),
          beforeEnter: spy()
        }),
      bazState = registry
        .add('app.foo.bar.baz', {
          path: '/baz/:bazParam',
          resolve: {
            bazResolve: ['barResolve@app.foo.bar', spy()]
          },
          beforeExit: spy(),
          beforeUpdate: spy(),
          beforeEnter: spy()
        }),
      quxState = registry
        .add('qux', {
          path: '/qux',
          beforeExit: spy(),
          beforeUpdate: spy(),
          beforeEnter: spy()
        }),
      quuxState = registry
        .add('quux', {
          parent: 'qux',
          path: '/:quuxParam',
          resolve: {
            quuxResolve: spy()
          },
          beforeExit: spy(),
          beforeUpdate: spy(),
          beforeEnter: spy()
        })
    ]

    states.forEach(state => resolves.addTo(state))
  })


  describe('.init(startState, startParams)', () => {

    it('should initialize', () => {
      const rootState = registry.$root
      const params = {}
      const query = {}
      machine.init(rootState, params, query)
      expect(machine.$state.current).to.equal(rootState)
      expect(machine.$state.params).to.equal(params)
      expect(machine.$state.query).to.equal(query)
      expect(machine.transition).to.equal(null)
    })

  })

  describe('.hasState(stateName, params, query)', () => {

    it('should know whether a state is active', () => {
      expect(machine.hasState('app')).to.equal(false)
      machine.init(
        bazState, { bazParam: '42', fooParam: '7' }, { barQuery: 'smashing' }
      )
      const hasRoot = machine.hasState('')
      const hasFoo = machine.hasState('app.foo', { fooParam: '7' })
      expect(hasRoot).to.equal(true)
      expect(hasFoo).to.equal(true)
      machine.init(quxState, {}, {})
      const hasQux = machine.hasState('qux')
      expect(hasQux).to.equal(true)
    })

  })

  describe('.isInState(stateName, params, query)', () => {

    it('knows if its current state matches a given state', () => {
      expect(machine.isInState('app.foo.bar.baz')).to.equal(false)
      machine.init(bazState, { bazParam: '42', fooParam: '7' })
      expect(machine.isInState(
        'app.foo.bar.baz', { bazParam: '41', fooParam: '6' }
      )).to.equal(false)
      expect(machine.isInState(
        'app.foo.bar.baz', { bazParam: '42', fooParam: '7' }
      )).to.equal(true)
    })

  })

  describe('.createTransition(state, params, query, options)', () => {

    it('should create a transition from "root" to "app"', () => {

      const params = {}
      const query = {}

      machine.init(registry.$root, initialParams, initialQuery)

      const transition = machine.createTransition(appState, params, query)

      expect(transition._tasks.length).to.equal(0)
      expect(transition._exiting.length).to.equal(0)

      expect(rootState.beforeEnter.called).to.equal(false)
      expect(rootState.beforeUpdate.called).to.equal(false)
      expect(rootState.beforeExit.called).to.equal(false)

      expect(appState.beforeEnter.calledOnce).to.equal(true)
      expect(appState.beforeUpdate.called).to.equal(false)
      expect(appState.beforeExit.called).to.equal(false)
    })

    it('should create a transition from "root" to "foo"', () => {

      const params = { fooParam: '42' }
      const query = {}

      machine.init(registry.$root, initialParams, initialQuery)

      const transition = machine.createTransition(fooState, params, query)

      expect(transition._tasks.length).to.equal(1)
      expect(transition._exiting.length).to.equal(0)

      expect(rootState.beforeEnter.called).to.equal(false)
      expect(rootState.beforeUpdate.called).to.equal(false)
      expect(rootState.beforeExit.called).to.equal(false)

      expect(appState.beforeEnter.calledOnce).to.equal(true)
      expect(appState.beforeUpdate.called).to.equal(false)
      expect(appState.beforeExit.called).to.equal(false)

      expect(fooState.beforeEnter.calledOnce).to.equal(true)
      expect(fooState.beforeUpdate.called).to.equal(false)
      expect(fooState.beforeExit.called).to.equal(false)
    })

    it('should create a transition from "root" to "baz"', () => {

      const params = { fooParam: '42', bazParam: '7' }
      const query = { barQuery: 'q' }

      machine.init(rootState, initialParams, initialQuery)

      const transition = machine.createTransition(bazState, params, query)

      expect(transition._tasks.length).to.equal(3)
      expect(transition._exiting.length).to.equal(0)

      expect(rootState.beforeEnter.called).to.equal(false)
      expect(rootState.beforeUpdate.called).to.equal(false)
      expect(rootState.beforeExit.called).to.equal(false)

      expect(appState.beforeEnter.calledOnce).to.equal(true)
      expect(fooState.beforeEnter.calledOnce).to.equal(true)
      expect(barState.beforeEnter.calledOnce).to.equal(true)
      expect(bazState.beforeEnter.calledOnce).to.equal(true)
    })

    it('should create a transition from "baz" to "app"', () => {

      machine.init(bazState, {}, {})

      const transition = machine.createTransition(appState, {}, {})

      expect(transition._tasks.length).to.equal(0)
      expect(transition._exiting.length).to.equal(3)

      expect(appState.beforeEnter.called).to.equal(false)
      expect(appState.beforeUpdate.called).to.equal(false)
      expect(appState.beforeExit.calledOnce).to.equal(false)

      expect(fooState.beforeEnter.called).to.equal(false)
      expect(fooState.beforeUpdate.called).to.equal(false)
      expect(fooState.beforeExit.calledOnce).to.equal(true)

      expect(barState.beforeEnter.called).to.equal(false)
      expect(barState.beforeUpdate.called).to.equal(false)
      expect(barState.beforeExit.calledOnce).to.equal(true)

      expect(bazState.beforeEnter.called).to.equal(false)
      expect(bazState.beforeUpdate.called).to.equal(false)
      expect(bazState.beforeExit.calledOnce).to.equal(true)
    })

    it('should create a transition from "baz" to "qux"', () => {

      machine.init(bazState, {}, {})

      const transition = machine.createTransition(quxState, {}, {})

      expect(transition._tasks.length).to.equal(0)
      expect(transition._exiting.length).to.equal(4)

      expect(appState.beforeEnter.called).to.equal(false)
      expect(appState.beforeUpdate.called).to.equal(false)
      expect(appState.beforeExit.calledOnce).to.equal(true)

      expect(fooState.beforeEnter.called).to.equal(false)
      expect(fooState.beforeUpdate.called).to.equal(false)
      expect(fooState.beforeExit.calledOnce).to.equal(true)

      expect(barState.beforeEnter.called).to.equal(false)
      expect(barState.beforeUpdate.called).to.equal(false)
      expect(barState.beforeExit.calledOnce).to.equal(true)

      expect(bazState.beforeEnter.called).to.equal(false)
      expect(bazState.beforeUpdate.called).to.equal(false)
      expect(bazState.beforeExit.calledOnce).to.equal(true)

      expect(quxState.beforeEnter.calledOnce).to.equal(true)
      expect(quxState.beforeUpdate.called).to.equal(false)
      expect(quxState.beforeExit.called).to.equal(false)
    })

  })

  describe('.transitionTo(stateOrName, params, query, options)', () => {

    it('should transition from "root" to "app"', done => {
      machine.init(rootState, initialParams, initialQuery)
      const params = {}
      const query = {}
      return machine
        .transitionTo(appState, params, query)
        .then(transition => {
          transition._commit()
          expect(machine.$state.current).to.equal(appState)
          expect(machine.$state.params).to.equal(params)
          expect(machine.$state.query).to.equal(query)
          transition._cleanup()
        })
        .then(done)
        .catch(done)
    })

    it('should transition from "root" to "app" by name', done => {
      machine.init(rootState, initialParams, initialQuery)
      const params = {}
      const query = {}
      return machine
        .transitionTo('app', params, query)
        .then(transition => {
          transition._commit()
          expect(machine.$state.current).to.equal(appState)
          expect(machine.$state.params).to.equal(params)
          expect(machine.$state.query).to.equal(query)
          transition._cleanup()
        })
        .then(done)
    })

    it('should transition from "root" to "foo"', done => {
      machine.init(rootState, initialParams, initialQuery)
      const params = { fooParam: '42' }
      const query = {}
      return machine.transitionTo(fooState, params, query)
        .then(transition => {
          transition._commit()
          expect(fooState.resolve.fooResolve.called).to.equal(true)
          expect(machine.$state.current).to.equal(fooState)
          expect(machine.$state.params).to.equal(params)
          expect(machine.$state.query).to.equal(query)
          transition._cleanup()
        })
        .then(done)
    })

    it('should transition from "root" to "bar"', done => {
      machine.init(rootState, initialParams, initialQuery)
      const params = { fooParam: '42' }
      const query = { barQuery: '7' }
      return machine.transitionTo(barState, params, query)
        .then(transition => {
          transition._commit()
          expect(fooState.resolve.fooResolve.called).to.equal(true)
          expect(barState.resolve.barResolve.called).to.equal(true)
          expect(machine.$state.current).to.equal(barState)
          expect(machine.$state.params).to.equal(params)
          expect(machine.$state.query).to.equal(query)
          transition._cleanup()
        })
        .then(done)
    })

    it('should transition from "foo" to "bar"', done => {
      machine.init(fooState, { fooParam: '42' }, {})
      machine.cache.set('fooResolve@app.foo', '42')
      const params = { fooParam: '42' }
      const query = { barQuery: '7' }
      return machine
        .transitionTo(barState, params, query)
        .then(transition => {
          transition._commit()
          expect(fooState.resolve.fooResolve.called).to.equal(false)
          expect(barState.resolve.barResolve.called).to.equal(true)
          expect(machine.$state.current).to.equal(barState)
          expect(machine.$state.params).to.equal(params)
          expect(machine.$state.query).to.equal(query)
          transition._cleanup()
        })
        .then(done)
    })

    it('should transition from "foo" to "baz"', () => {
      machine.init(fooState, { fooParam: '42' }, {})
      const params = { fooParam: '42', bazParam: '50' }
      const query = { barQuery: '7' }
      return machine
        .transitionTo(bazState, params, query)
    })

    it('should transition from "baz" to "quux"', done => {
      machine.init(
        bazState, { fooParam: '42', bazParam: '24' }, { barQuery: '7' }
      )
      const params = { quuxParam: 'fin' }
      const query = {}
      return machine
        .transitionTo(quuxState, params, query)
        .then(transition => {
          transition._commit()
          expect(fooState.resolve.fooResolve.called).to.equal(false)
          expect(quuxState.resolve.quuxResolve.calledOnce).to.equal(true)
          expect(machine.$state.current).to.equal(quuxState)
          expect(machine.$state.params).to.equal(params)
          expect(machine.$state.query).to.equal(query)
          transition._cleanup()
        })
        .then(done)
    })

    it('should rethrow any unhandled resolve error', () => {
      machine.init(rootState, initialParams, initialQuery)
      stub(registry.states['app.foo'].$resolves[0], 'execute')
        .throws(new Error('oops!'))
      const params = { fooParam: 'foo' }
      const query = {}
      return expect(machine.transitionTo('app.foo', params, query))
            .to.eventually.be.rejectedWith(Error, 'oops!')
    })

    it('should not run resolves if canceled by hook', () => {
      appState.beforeEnter = transition => transition.cancel()
      machine.init(rootState, {}, {})
      return machine
        .transitionTo(fooState, { fooParam: '42' }, { barQuery: '7' })
        .then(transition => {
          expect(transition.isCanceled()).to.be.true
          expect(fooState.resolve.fooResolve.called).to.be.false
        })
    })

    it('should not run resolves if superseded by hook', done => {
      appState.beforeEnter = transition => transition.redirect('qux', {}, {})
      machine.init(rootState, {}, {})
      return machine
        .transitionTo(fooState, { fooParam: '42' }, { barQuery: '7' })
        .catch(err => {
          expect(err.message).to.equal('transition superseded')
          expect(fooState.resolve.fooResolve).not.to.have.been.called
        })
        .then(done)
    })

    it('should not run resolves if canceled by listener', () => {
      machine.init(rootState, {}, {})
      events.notify = (eventName, transition) => {
        eventName === 'stateChangeStart' && transition.cancel()
      }
      return machine
        .transitionTo(fooState, { fooParam: '42' }, { barQuery: '7' })
        .then(transition => {
          expect(transition.isCanceled()).to.be.true
          expect(fooState.resolve.fooResolve).not.to.have.been.called
        })
    })

    it('should not run resolves if superseded by listener', done => {
      machine.init(rootState, {}, {})
      events.notify = (eventName, transition) => {
        eventName === 'stateChangeStart' &&
        transition.toState.name !== 'qux' &&
        transition.redirect('qux', {}, {})
      }
      return machine
        .transitionTo(fooState, { fooParam: '42' }, { barQuery: '7' })
        .catch(err => {
          expect(err.message).to.equal('transition superseded')
          expect(fooState.resolve.fooResolve.called).to.equal(false)
        })
        .then(done)
    })

  })

})
