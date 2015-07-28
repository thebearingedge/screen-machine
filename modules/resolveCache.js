
'use strict';


var xtend = require('xtend');


var cache = {

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


module.exports = function resolveCache(options) {

  var instance;

  if (options && options.stateless) {

    instance = xtend(cache);
    instance.$store = {};
  }
  else {

    instance = cache;
  }

  return instance;
};
