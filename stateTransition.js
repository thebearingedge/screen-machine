
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
    var f = fromBranch.length;

    while (f-- && !to.contains(fromBranch[f])) {

      deadNodes.unshift(fromBranch[f]);
    }

    return deadNodes;
  }


  function getStaleNodes(to, params) {

    var staleNodes = [];

    var toBranch = to.getBranch();
    var t = toBranch.length;

    while (t--) {

      if (toBranch[t].isStale(params)) {

        staleNodes.unshift(toBranch[t]);
      }
    }

    return staleNodes;
  }

}
