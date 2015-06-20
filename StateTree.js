
'use strict';

module.exports = StateTree;

function StateTree(Node) {

  if (!(this instanceof StateTree)) {

    return new StateTree(Node);
  }

  this._Node = Node;
  this._leafQueue = {};

  var $root = new Node({ name: '$root' });

  this._nodes = { '': $root };
  this.$root = $root;
}


StateTree.prototype.getRoot = function () {

  return this.$root;
};


StateTree.prototype.attach = function (name, nodeDef) {

  if (arguments.length === 2) nodeDef.name = name;
  else nodeDef = name;

  var node = new this._Node(nodeDef);

  this._registerNode(node);

  return this;
};


StateTree.prototype._registerNode = function (node) {

  var parentName = node.getParentName();
  var parentNode = this._nodes[parentName];

  if (parentName && !parentNode) {

    return this._queueLeaf(node);
  }

  this._nodes[node.name] = node.attachTo(parentNode || this.$root);
  this._flushQueueOf(node);

  return node;
};


StateTree.prototype._queueLeaf = function (node) {

  var queue = this._leafQueue[node.parent];

  if (queue === undefined) {

    queue = this._leafQueue[node.parent] = [];
  }

  queue.push(node);
};


StateTree.prototype._flushQueueOf = function (node) {

  var queue = this._leafQueue[node.name];

  if (queue === undefined) return;

  while (queue.length) {

    this._registerNode(queue.pop());
  }

  queue = this._leafQueue[node.name] = undefined;
};
