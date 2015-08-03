
'use strict';

module.exports = {

  store: {},


  set: function (resolveName, value) {

    this.store[resolveName] = value;

    return this;
  },


  unset: function (resolveName) {

    delete this.store[resolveName];

    return this;
  },


  get: function (resolveName) {

    return this.store[resolveName];
  },


  has: function (resolveName) {

    return resolveName in this.store;
  }

};
