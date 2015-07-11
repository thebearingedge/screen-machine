
'use strict';

var slice = [].slice;


module.exports = View;


function View(viewKey, state, renderer) {

  this.viewKey = viewKey;
  this.state = state;
  this.renderer = renderer;

  var targetNames = viewKey.split('@');

  this.hostState = targetNames[1]
    ? targetNames[1]
    : state.name;
  this.targetViewport = targetNames[0] || null;
}


View.prototype.isHostedBy = function (stateName) {

  return this.targetStateName === stateName;
};


View.prototype.appearsWithin = function (viewportName) {

  return this.targetViewport === viewportName;
};


View.prototype.render = function (viewPort, resolve) {

  this.renderer.compose(this, viewPort, resolve, this.state.data);

  return this;
};


View.prototype.getChildren = function () {

  return slice.call(this.element.querySelectorAll('[sm-view]'))
    .map(function (node) {

      return {
        node: node,
        name: node.getAttribute('sm-view')
      };
    });
};


View.prototype.destroy = function () {

  var element = this.element;

  this.element = this.target = undefined;
  this.renderer.destroy(element);

  return this;
};
