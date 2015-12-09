
export default class View {

  constructor(viewKey, tree) {
    const viewName = viewKey.slice(0, viewKey.indexOf('@'))
    const selector = viewName
      ? 'sm-view[name="' + viewName + '"]'
      : 'sm-view:not([name])'
    const components = {}
    Object.assign(this, { viewKey, tree, viewName, selector, components })
  }

  attachWithin(node) {
    const element = node.querySelector(this.selector)
    const content = element ? element.firstElementChild : null
    return Object.assign(this, { element, content })
  }

  detach() {
    this.close()
    this.element = null
    return this
  }

  addComponent(stateName, component) {
    component.setView(this)
    this.components[stateName] = component
    return this
  }

  addChild(view) {
    view.parent = this
    this.children || (this.children = [])
    this.children.push(view)
    return this
  }

  setContainer(component) {
    component.view.addChild(this)
    component.addChildView(this)
    this.container = component
    return this
  }

  loadComponent(component) {
    if (this.isLoaded()) return this
    this.nextComponent = component
    this.tree.loadedViews.push(this)
    return this
  }

  unload() {
    (this.children || [])
        .filter(child => child.isLoaded())
        .forEach(child => child.unload())
    const { loadedViews } = this.tree
    loadedViews.splice(loadedViews.indexOf(this), 1)
    this.nextComponent = null
    return this
  }

  isLoaded() {
    return this.tree.loadedViews.indexOf(this) > -1
  }

  isShadowed() {
    const { container } = this
    return !!container && container.view.nextComponent !== container
  }

  publish(resolved, params, query) {
    const { currentComponent } = this
    if (this.shouldUpdate()) {
      currentComponent.update(resolved, params, query)
      return this
    }
    const { content, element, nextComponent } = this
    const { node } = nextComponent
    if (content) element.replaceChild(node, content)
    else element.appendChild(node)
    return Object.assign(this, {
      content: node,
      lastComponent: currentComponent,
      currentComponent: nextComponent,
      nextComponent: null
    })
  }

  shouldUpdate() {
    const { currentComponent, nextComponent } = this
    return !!currentComponent && currentComponent === nextComponent
  }

  shouldClose() {
    return !this.isLoaded()
  }

  close() {
    const { content, element, currentComponent } = this
    if (content) element.removeChild(content)
    if (currentComponent) currentComponent.destroy()
    this.content = this.currentComponent = null
    return this
  }

  cleanUp() {
    this.lastComponent && this.lastComponent.destroy()
    this.lastComponent = null
    return this
  }

}

View.prototype.parent = null
View.prototype.children = null
View.prototype.container = null
View.prototype.element = null
View.prototype.content = null
View.prototype.nextComponent = null
View.prototype.currentComponent = null
View.prototype.lastComponent = null
