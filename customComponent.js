
'use strict'

import BaseComponent from './modules/BaseComponent'

export default function customComponent(document) {

  class CustomComponent extends BaseComponent {

    constructor(componentName, viewKey, state) {
      super(...arguments)
      const { views, component } = state
      this.factory = views ? views[viewKey].component : component
      this.viewController = null
    }

    render() {
      const { factory, childViews } = this
      const { viewController, node } = factory(...arguments, document)
      childViews.forEach(view => view.attachWithin(node))
      return Object.assign(this, { viewController, node })
    }

    update() {
      this.viewController.update(...arguments)
      return this
    }

    destroy() {
      const { viewController, childViews } = this
      viewController.destroy()
      childViews.forEach(view => view.detach())
      this.viewController = this.node = null
      return this
    }

  }

  return CustomComponent

}
