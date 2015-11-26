
import State from './state'

export default function stateRegistry() {

  const rootState = new State({ name: '' })

  return {

    $root: rootState,

    states: { '': rootState },

    queues: {},

    add(name, definition) {
      if (arguments.length === 2) definition.name = name
      else definition = name
      if (!definition.name || typeof definition.name !== 'string') {
        throw new Error('State definitions must include a string name')
      }
      const state = new State(definition)
      this.register(state)
      return state
    },

    register(state) {
      const { states } = this
      const parentName = state.parent
      const parentState = states[parentName]
      if (parentName && !parentState) return this.enqueue(parentName, state)
      states[state.name] = state.inheritFrom(parentState || this.$root)
      this.flushQueueFor(state)
    },

    enqueue(parentName, state) {
      this.queues[parentName] || (this.queues[parentName] = [])
      this.queues[parentName].push(state)
    },

    flushQueueFor(state) {
      const queue = this.queues[state.name]
      while (queue && queue.length) this.register(queue.pop())
    }

  }

}
