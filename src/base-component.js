
export default class BaseComponent {

  constructor(componentName, viewKey, state) {
    this.name = componentName
    this.state = state
    this.childViews = []
    this.node = null
  }

  setView(view) {
    this.view = view
    return this
  }

  addChildView(view) {
    this.childViews.push(view)
    return this
  }

  shouldRender() {
    const { view } = this
    return !view.isShadowed() &&
            view.nextComponent === this &&
            view.currentComponent !== this
  }

  load() {
    this.view.loadComponent(this)
    return this
  }

}
