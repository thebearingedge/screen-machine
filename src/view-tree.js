
import View from './view'

export default function viewTree(document, Component) {

  const tree = { loadedViews: [], activeViews: [] }
  const rootView = new View('@', tree)

  return {

    $root: rootView,

    views: { '@': rootView },

    mountRoot() {
      rootView.attachWithin(document.body)
      tree.activeViews.push(rootView)
    },

    processState(state) {
      const { views, component } = state
      let componentName
      let view
      if (views) {
        Object
          .keys(views)
          .sort()
          .forEach(viewKey => {
            componentName = viewKey
            view = this.ensureView(viewKey, state)
            this.createComponent(componentName, viewKey, state, view)
          })
      }
      else if (component) {
        componentName = ''
        view = this.ensureView(null, state)
        this.createComponent(componentName, view.viewKey, state, view)
      }
      return this
    },

    ensureView(viewKey, state) {
      viewKey || (viewKey = '@' + (state.parent || ''))
      return this.views[viewKey] || this.createView(viewKey, state)
    },

    createView(viewKey, state) {
      viewKey = viewKey.indexOf('@') > -1
        ? viewKey
        : viewKey + '@' + state.parent
      const targetStateName = viewKey.slice(viewKey.indexOf('@') + 1)
      const targetState = targetStateName === state.name
        ? state
        : state.getAncestor(targetStateName)
      const view = new View(viewKey, tree)
      this.views[viewKey] = view
      targetState.addView(view)
      const container = targetState.getComponents().sort()[0]
      view.setContainer(container)
      return view
    },

    createComponent(componentName, viewKey, state, view) {
      const component = new Component(...arguments)
      view.addComponent(state.name, component)
      state.addComponent(component)
      return component
    },

    compose(components, resolved, params, query) {
      components
        .map(component => component.load())
        .filter(component => component.shouldRender())
        .forEach(component => component.render(resolved, params, query))
      const { loadedViews, activeViews } = tree
      loadedViews
        .filter(loaded => loaded.isShadowed())
        .forEach(shadowed => shadowed.unload())
      const toClose = activeViews
        .filter(active => active.shouldClose())
      tree.activeViews = loadedViews.slice()
      loadedViews
        .map(loaded => loaded.publish(resolved, params, query))
        .forEach(published => published.cleanUp())
      toClose.forEach(open => open.close())
      loadedViews.slice().forEach(view => view.unload())
    }

  }

}
