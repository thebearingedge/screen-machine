
'use strict';

module.exports = {

  results: {},


  set: function (resolveName, result) {

    this.results[resolveName] = result;

    return this;
  },


  unset: function (resolveName) {

    delete this.results[resolveName];

    return this;
  },


  get: function (resolveName) {

    return this.results[resolveName];
  }

};
