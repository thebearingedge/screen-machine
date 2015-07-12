

// View might not delegate to renderer.

'use strict';

module.exports = View;


function View(viewKey, state, renderer) {

  // If I'm going to accept a `beforeRender` hook,
  // then I should capture it now... maybe.
  this.viewKey = viewKey;
  this.data = state.data;
  this.renderer = renderer;

  var targetNames = viewKey.split('@');

  this.targetViewportName = targetNames[0] || null;

  var targetStateName = targetNames[1]
    ? targetNames[1]
    : state.name;

  this.targetState = (targetStateName === state.name)
    ? state
    : state.getAncestor(targetStateName);
}


View.prototype.rendersDuring = function (state) {

  return this.targetState === state;
};


View.prototype.nestsIn = function (viewportName) {

  return this.targetViewportName === viewportName;
};


View.prototype.isActive = function () {

  return !!this.component;
};


View.prototype.render = function (resolve) {

  this.component = this.renderer.execute(this, resolve);

  return this;
};


View.prototype.destroy = function () {

  var component = this.component;

  this.component = undefined;
  this.renderer.destroy(component);

  return this;
};
