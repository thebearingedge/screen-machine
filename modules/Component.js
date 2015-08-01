
'use strict';


module.exports = Component;


function Component(viewKey, state, view) {

  this.name = viewKey.slice(0, viewKey.indexOf('@'));
  this.view = view;
}


Component.prototype.willPublish = function () {

  return this.view.nextComponet === this;
};


Component.prototype.load = function () {

  this.view.loadComponent(this);

  return this;
};
