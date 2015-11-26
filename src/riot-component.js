
import BaseComponent from './base-component'

export default function riotComponent(riot) {

  return function component(document, events, machine, router) {

    const linkTagName = 'sm-link'
    const linkTemplate = `<a href="{ href }" class="{ activeClass }">
                            <yield/>
                          </a>`

    class SmLink {

      constructor(opts) {
        const { to, params, query, hash, active } = opts
        this.href = router.href(to, params, query, hash || '')
        const matchActive = () => {
          const isActive = machine.hasState(to, params, query)
          this.activeClass = isActive ? active : null
          this.update()
        }
        matchActive()
        events.subscribe('stateChangeSuccess', matchActive)
        this.on('unmount', () => {
          events.unsubscribe('stateChangeSuccess', matchActive)
        })
      }

    }

    riot.tag(linkTagName, linkTemplate, SmLink)

    class RiotComponent extends BaseComponent {

      constructor(componentName, viewKey, state) {
        super(...arguments)
        const { views, component } = state
        this.tagName = views ? views[viewKey].component : component
        this.tagInstance = null
      }

      render(resolved, params, query) {
        const { tagName, childViews } = this
        const opts = this.getOpts(resolved, params, query)
        const node = document.createElement(tagName)
        const [ tagInstance ] = riot.mount(node, tagName, opts)
        childViews.forEach(view => view.attachWithin(node))
        return Object.assign(this, { node, tagInstance })
      }

      update(resolved, params, query) {
        const { tagInstance } = this
        tagInstance.opts = this.getOpts(resolved, params, query)
        tagInstance.update()
        return this
      }

      destroy() {
        this.tagInstance.unmount()
        this.tagInstance = this.node = null
        this.childViews.forEach(view => view.detach())
        return this
      }

      getOpts(resolved, params, query) {
        return this
          .state
          .getResolves()
          .reduce((opts, resolve) => {
            return Object.assign(opts, { [resolve.key]: resolved[resolve.id] })
          }, { params, query })
      }

    }

    return RiotComponent

  }

}
