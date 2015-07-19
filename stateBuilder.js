
'use strict';

var State = require('./State');
var resolveFactory = require('./resolveFactory');


module.exports = {

  build: function (name, definition) {

    if (arguments.length === 2) definition.name = name;
    else definition.name = name;

    if (!definition.name || typeof definition.name !== 'string') {

      throw new Error('State definitions must include a string name');
    }

    var state = new State(definition);

    return this.addResolves(state);
  },


  addResolves: function (state) {

    var raw = state.resolve;
    var key, resolve;

    for (key in raw) {

      resolve = resolveFactory.instantiate(key, state);
      state.addResolve(resolve);
    }

    return state;
  }

};
