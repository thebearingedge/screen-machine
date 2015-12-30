
import Transition from './transition'

export default function stateMachine(events, registry, Promise) {

  return {

    $state: { current: null, params: null, query: null },

    transition: null,

    init(state, params, query) {
      const $state = { current: state, params, query }
      const transition = null
      return Object.assign(this, { $state, transition })
    },

    getState(stateName) {
      return registry.states[stateName]
    },

    hasState(stateOrName, params, query) {
      const { current } = this.$state
      if (!current) return false
      const state = this.getState(stateOrName)
      return state &&
             current.contains(state) &&
             this.hasParams(params, query)
    },

    isInState(stateOrName, params, query) {
      const { current } = this.$state
      return !!current &&
             current === this.getState(stateOrName) &&
             this.hasParams(params, query)
    },

    hasParams(params, query) {
      return equalForKeys(params || {}, this.$state.params) &&
             equalForKeys(query || {}, this.$state.query)
    },

    createTransition(stateOrName, params, query) {
      const { $state, cache } = this
      const toState = typeof stateOrName === 'string'
        ? registry.states[stateOrName]
        : stateOrName
      const fromState = $state.current
      const fromParams = $state.params
      const fromQuery = $state.query
      const fromBranch = fromState.getBranch()
      const toBranch = toState.getBranch()
      const exiting = fromBranch.filter(exitingFrom(toState))
      const pivotState = exiting[0]
        ? exiting[0].getParent()
        : null
      const toUpdate = dirtyFilter(fromParams, fromQuery, params, query, cache)
      let entering, updating
      if (pivotState) {
        const pivotAfter = toBranch.indexOf(pivotState) + 1
        entering = toBranch.slice(pivotAfter)
        updating = toBranch
          .slice(0, entering.length ? pivotAfter : toBranch.length)
          .filter(toUpdate)
      }
      else {
        entering = toBranch.slice(toBranch.indexOf(fromState) + 1)
        updating = fromBranch.filter(toUpdate)
      }
      const transition = new Transition(this, toState, params, query)
      const resolves = entering.concat(updating).reduce(collectResolves, [])
      this.transition = transition._prepare(resolves, cache, exiting, Promise)
      exiting.reverse().forEach(callHook('beforeExit', transition))
      updating.forEach(callHook('beforeUpdate', transition))
      entering.forEach(callHook('beforeEnter', transition))
      return transition
    },

    transitionTo() {
      const transition = this.createTransition(...arguments)
      events.notify('stateChangeStart', transition)
      if (transition.isCanceled()) return Promise.resolve(transition)
      return transition
        ._attempt()
        .catch(err => {
          if (!events.notify('stateChangeError', err)) throw err
        })
    },

    cache: {

      $store: {},

      get(id) {
        return this.$store[id]
      },

      set(id, value) {
        this.$store[id] = value
      },

      unset(id) {
        delete this.$store[id]
      },

      has(id) {
        return id in this.$store
      }

    },

    getResolved() {
      return Object.assign({}, this.cache.$store)
    }

  }
}


function dirtyFilter(fromParams, fromQuery, params, query, cache) {
  return function toUpdate(activeState) {
    return activeState.isStale(fromParams, fromQuery, params, query) ||
           activeState.shouldResolve(cache)
  }
}

function exitingFrom(destination) {
  return function isExiting(activeState) {
    return !destination.contains(activeState)
  }
}

function collectResolves(resolves, state) {
  return resolves.concat(state.getResolves())
}

function callHook(hook, transition) {
  return function callTransitionHook(state) {
    typeof state[hook] === 'function' && state[hook].call(state, transition)
  }
}

function equalForKeys(partial, complete) {
  return Object
    .keys(partial)
    .every(key => complete[key] === partial[key])
}
