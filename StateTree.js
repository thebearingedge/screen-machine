
'use strict';

module.exports = StateTree;

function StateTree() {

  this.leafQueues = {};

  var $root =  { name: '$root' };

  this.nodes = { '': $root };
  this.$root = $root;
}


StateTree.prototype.addNode = function (node) {

  this.registerNode(node);

  return this;
};


StateTree.prototype.registerNode = function (node) {

  var parentNode = this.nodes[node.parent];

  if (node.parent && !parentNode) {

    return this.queueLeaf(node);
  }

  this.nodes[node.name] = node.attachTo(parentNode || this.$root);
  this.flushQueueOf(node);

  return node;
};


StateTree.prototype.queueLeaf = function (node) {

  var queue = this.leafQueues[node.parent];

  if (queue === undefined) {

    queue = this.leafQueues[node.parent] = [];
  }

  queue.push(node);
};


StateTree.prototype.flushQueueOf = function (node) {

  var queue = this.leafQueues[node.name];

  if (queue === undefined) return;

  while (queue.length) {

    this.registerNode(queue.pop());
  }

  queue = this.leafQueues[node.name] = undefined;
};
