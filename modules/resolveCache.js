
'use strict';

module.exports = {

  $store: {},


  set: function (resolveId, value) {

    this.$store[resolveId] = value;

    return this;
  },


  unset: function (resolveId) {

    delete this.$store[resolveId];

    return this;
  },


  get: function (resolveId) {

    return this.$store[resolveId];
  }

};
