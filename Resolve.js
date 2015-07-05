
'use strict';

var xtend = require('xtend/mutable');

module.exports = Resolve;


function Resolve(Promise) {

  this.Promise = Promise;

}


Resolve.prototype._filterStateNodes = function (state, params) {



};



Resolve.prototype._getInvokables = function (states) {

  var invokables = {};

  var i = states.length;

  while (i--) {

    xtend(invokables, states[i].resolve);
  }

  return invokables;
};


Resolve.prototype._buildPlan = function (invokables) {

  var VISIT_IN_PROGRESS = 1;
  var VISIT_DONE = 2;

  var cycle = [];
  var plan = [];
  var visited = {};

  for (var invokable in invokables) {

    visit(invokable);
  }

  return plan;

  function visit(key) {

    if (visited[key] === VISIT_DONE) return;

    cycle.push(key);

    if (visited[key] === VISIT_IN_PROGRESS) {

      cycle.splice(0, cycle.indexOf(key));
      throw new Error('Cyclic Dependency: ' + cycle.join(' -> '));
    }

    visited[key] = VISIT_IN_PROGRESS;

    var dependencies = Array.isArray(invokables[key])
      ? invokables[key].slice(0, invokables[key].length - 1)
      : null;

    if (dependencies) {

      dependencies.forEach(function (key) {

        visit(key);
      });
    }

    plan.push(key, invokables[key]);
    cycle.pop();
    visited[key] = VISIT_DONE;
  }

};


var myInvokables = {
  'foo': ['baz', function () {}],
  'bar': ['foo', 'baz', function () {}],
  'baz': function () {},
  'qux': ['baz', 'bar', function () {}]
};

var plan = Resolve.prototype._buildPlan(myInvokables);

console.dir(plan);
