
'use strict';

import Segment from './routeSegment';

class Route {

  constructor(name, path) {
    const splitNames = name.split('.');
    const parentName = splitNames[1] ?
      splitNames.slice(0, splitNames.length - 1).join('.')
      : null;
    const pathParts = (path.startsWith('/') ? path.slice(1) : path).split('/');
    const segments = pathParts.map(part => Segment.create(part));
    const specificity = segments.map(segment => segment.specificity).join('');
    Object.assign(this, {
      name, path, segments, specificity, parentName
    });
  }

  isAbsolute() {
    return this.path.startsWith('/');
  }

  isSplat() {
    return this.path.startsWith('*');
  }

  addChild(route) {
    route.parent = this;
    this.children || (this.children = []);
    this.children.push(route);
  }

  match(unmatched) {
    const { path, segments } = this;
    const matched = [];
    let result;
    if (this.isSplat()) {
      const remainder = unmatched.join('/');
      const key = path.slice(1);
      result = {};
      result[key] = remainder;
      matched.push(result);
      unmatched.splice(0);
      return matched;
    }
    const toMatch = segments.length;
    let i = 0;
    while (i < toMatch && toMatch <= unmatched.length) {
      const segment = segments[i];
      // jshint -W084
      if (result = segment.match(unmatched[i])) matched.push(result);
      else break;
      i++;
    }
    if (matched.length < toMatch) return null;
    unmatched.splice(0, toMatch);
    return matched;
  }

  generate(params) {
    const allSegments = [];
    let route = this;
    while (route) {
      route
        .segments.slice().reverse()
        .forEach(segment => allSegments.unshift(segment));
      route = route.parent;
    }
    const path = allSegments
      .map(segment => segment.interpolate(params))
      .filter(interpolated => interpolated !== '')
      .join('/');
    return '/' + path;
  }

}

Route.prototype.parent = null;
Route.prototype.children = null;

export default Route;
