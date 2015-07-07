
'use strict';

module.exports = {

  $root: null,


  init: function (rootNode) {

    this.$root = rootNode;
  },


  addNode: function (node) {

    var parentName = node.parent;
    var parentNode = this.nodes[parentName];

    if (parentName && !parentNode) {

      return this.queueLeaf(node);
    }

    this.nodes[node.name] = node.attachTo(parentNode || this.$root);
    this.flushQueueOf(node);

    return node;
  },


  queueLeaf: function (node) {

    var queue = this.leafQueues[node.parent];

    if (queue === undefined) {

      queue = this.leafQueues[node.parent] = [];
    }

    queue.push(node);
  },


  flushQueueOf: function (node) {

    var queue = this.leafQueues[node.name];

    if (queue === undefined) return;

    while (queue.length) {

      this.registerNode(queue.pop());
    }

    queue = this.leafQueues[node.name] = undefined;
  }

};
