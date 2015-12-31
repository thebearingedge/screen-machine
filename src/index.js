
import urlWatcher from './url-watcher'
import eventBus from './event-bus'
import viewTree from './view-tree'
import resolveFactory from './resolve-factory'
import routerFactory from './router-factory'
import stateRegistry from './state-registry'
import stateMachine from './state-machine'

export default function screenMachine(config) {

  const {
    document, promises, html5 = true, events: eventsConfig, components
  } = config
  const { defaultView: window } = document
  const events = eventBus(eventsConfig)
  const url = urlWatcher(window, { html5 })
  const router = routerFactory()
  const registry = stateRegistry()
  const resolves = resolveFactory(promises)
  const machine = stateMachine(events, registry, promises)
  const Component = components(document, events, machine, router)
  const views = viewTree(document, Component)

  return {

    get $state() {
      return machine.$state
    },

    state() {
      const registered = registry.add(...arguments)
      const { name, path, paramTypes } = registered
      if (path) router.add(name, path, paramTypes)
      resolves.addTo(registered)
      views.processState(registered)
      return this
    },

    hasState() {
      return machine.hasState(...arguments)
    },

    href() {
      return router.href(...arguments)
    },

    start() {
      machine.init(registry.$root, {})
      views.mountRoot()
      url.subscribe(this._watchUrl.bind(this))
      window.addEventListener('click', this._catchLinks.bind(this))
      return this
    },

    _watchUrl(url) {
      return this._navigateTo(url, { routeChange: true })
    },

    _navigateTo(url, options = {}) {
      const stateArgs = router.find(url)
      if (stateArgs) {
        stateArgs.push(options)
        return this
          .transitionTo(...stateArgs)
          .catch(err => {
            if (!events.notify('stateChangeError', err)) throw err
          })
      }
      events.notify('routeNotFound', url)
    },

    _catchLinks(evt) {
      const ignore = evt.altKey ||
                   evt.ctrlKey ||
                   evt.metaKey ||
                   evt.shiftKey ||
                   evt.defaultPrevented
      if (ignore) return true
      let anchor = null
      let node = evt.target
      while (node.parentNode) {
        if (node.nodeName === 'A') {
          anchor = node
          break
        }
        node = node.parentNode
      }
      if (!anchor) return true
      const href = anchor.getAttribute('href')
      if (href.match(/^([a-z]+:\/\/|\/\/)/)) return true
      evt.preventDefault()
      return this._navigateTo(href)
    },

    transitionTo(stateOrName, params, query, options = {}) {
      return machine
        .transitionTo(...arguments)
        .then(transition => {
          if (!transition.isSuccessful()) return transition
          transition._commit()
          const state = transition.toState
          const components = state.getAllComponents()
          const resolved = machine.getResolved()
          views.compose(components, resolved, params, query)
          if (!options.routeChange) {
            url.push(router.toUrl(state.name, params, query))
          }
          events.notify('stateChangeSuccess', transition)
          return transition._cleanup()
        })
    },

    go() {
      return this.transitionTo(...arguments)
    }

  }

}
