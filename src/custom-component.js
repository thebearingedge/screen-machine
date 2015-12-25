
'use strict'

import BaseComponent from './base-component'

export default function customComponent(document) {

  class CustomComponent extends BaseComponent {

    constructor(componentName, viewKey, state) {
      super(...arguments)
      const { views, component } = state
      this.factory = views ? views[viewKey].component : component
      this.controller = null
    }

    render(resolved, params, query) {
      const { factory, childViews } = this
      const props = this.getProps(...arguments)
      const { controller, node } = factory(props, document)
      childViews.forEach(view => view.attachWithin(node))
      return Object.assign(this, { controller, node })
    }

    update() {
      const props = this.getProps(...arguments)
      this.controller.update(props)
      return this
    }

    destroy() {
      const { controller, childViews } = this
      controller.destroy()
      childViews.forEach(view => view.detach())
      this.controller = this.node = null
      return this
    }

    getProps(resolved, params, query) {
      return this.state
        .getResolves()
        .reduce((props, r) => {
          return Object.assign(props, { [r.key]: resolved[r.id] })
        }, { params, query })
    }

  }

  return CustomComponent

}
