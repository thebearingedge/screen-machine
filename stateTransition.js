
'use strict';

module.exports = stateTransition;

function stateTransition(from, to, params) {

  return {
    go: go
  };


  function go() {

    var deadNodes = getDeadNodes(from, to);
    var staleNodes = getStaleNodes(to, params);

    staleNodes.forEach(function (node) {
      node.load(params);
    });

    deadNodes.forEach(function (node) {
      node.unload();
    });

    return to;
  }


  function getDeadNodes(from, to) {

    var deadNodes = [];

    var fromBranch = from.getBranch();
    var i = fromBranch.length;

    while (i-- && !to.contains(fromBranch[i])) {

      deadNodes.unshift(fromBranch[i]);
    }

    return deadNodes;
  }


  function getStaleNodes(to, params) {

    var staleNodes = [];

    var toBranch = to.getBranch();
    var i = toBranch.length;

    while (i--) {

      if (toBranch[i].isStale(params)) {

        staleNodes.unshift(toBranch[i]);
      }
    }

    return staleNodes;
  }

}
