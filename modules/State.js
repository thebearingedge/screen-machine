
'use strict';

class State {

  constructor(definition) {
    const { name, path, cacheable, parent } = definition;
    definition.cacheable = cacheable === false ? false : true;
    definition.path = path || '';
    definition.parent = parent || getParentName(name);
    const [ pathOnly, querySegment ] = definition.path.split('?');
    const splitPath = pathOnly.split('/');
    this.$definition = definition;
    this.$includes = { [name]: true };
    this.$ancestors = { [name]: this };
    this.$pathSegments = !!splitPath[0] ? splitPath : splitPath.slice(1);
    this.$querySegments = querySegment ? [querySegment] : [];
    this.$paramKeys = this
      .$pathSegments
      .filter(anySegment => anySegment.startsWith(':'))
      .map(dynamicSegment => dynamicSegment.slice(1));
    this.$queryKeys = querySegment ? querySegment.split('&') : [];
    Object.assign(this, definition);
  }

  inheritFrom(parentNode) {
    this.data = Object.assign({}, parentNode.data, this.data || {});
    Object.assign(this.$includes, parentNode.$includes);
    Object.assign(this.$ancestors, parentNode.$ancestors);
    this.$branch = parentNode.getBranch().concat(this);
    this.$pathSegments = parentNode.$pathSegments.concat(this.$pathSegments);
    this.$querySegments = parentNode.$querySegments.concat(this.$querySegments);
    this.$paramKeys = parentNode.$paramKeys.concat(this.$paramKeys);
    this.$parent = parentNode;
    return this;
  }

  contains(ancestor) {
    return this.$includes[ancestor.name] || false;
  }

  getBranch() {
    return (this.$branch || [this]).slice();
  }

  getParent() {
    return this.$parent;
  }

  getAncestor(stateName) {
    return this.$ancestors[stateName];
  }

  addResolve(resolve) {
    this.$resolves || (this.$resolves = []);
    this.$resolves.push(resolve);
    return this;
  }

  getResolves() {
    return (this.$resolves || []).slice();
  }

  filterParams(params) {
    return this
      .$paramKeys
      .reduce((ownParams, key) => {
        ownParams[key] = params[key];
        return ownParams;
      }, {});
  }

  isStale(oldParams, oldQuery, newParams, newQuery) {
    const { $paramKeys, $queryKeys } = this;
    const staleParams = $paramKeys.some(key => {
      return newParams[key] !== oldParams[key];
    });
    const staleQuery = $queryKeys.some(key => {
      return newQuery[key] !== oldQuery[key];
    });
    return staleParams || staleQuery;
  }

  sleep() {
    const { $views, $resolves } = this;
    $views && $views.forEach(view => view.detach());
    $resolves && $resolves.forEach(resolve => resolve.clear());
    return this;
  }

  addView(view) {
    this.$views || (this.$views = []);
    this.$views.push(view);
    return this;
  }

  getViews() {
    return (this.$views || []).slice();
  }

  addComponent(component) {
    this.$components || (this.$components = []);
    this.$components.push(component);
    return this;
  }

  getComponents() {
    return (this.$components || []).slice().reverse();
  }

  getAllComponents() {
    return this
      .getBranch()
      .reverse()
      .reduce((components, state) => {
        return components.concat(state.getComponents());
      }, []);
  }

  shouldResolve(cache) {
    const { $resolves, cacheable } = this;
    if (!$resolves) return false;
    if (!cacheable) return true;
    return $resolves.some(resolve => !(resolve.id in cache.$store));
  }

}

State.prototype.$parent = null;
State.prototype.$branch = null;
State.prototype.$resolves = null;
State.prototype.$views = null;
State.prototype.$components = null;
State.prototype.$paramCache = null;
State.prototype.$pathSegments = null;

export default State;

function getParentName(stateName) {
  return stateName.split('.').reverse().slice(1).reverse().join('.') || null;
}
