
'use strict';

var xtend = require('xtend/mutable');


module.exports = resolveCache;


var cache = {

  $store: {},


  set: function (resolveId, value) {

    this.$store[resolveId] = value;
  },


  unset: function (resolveId) {

    delete this.$store[resolveId];
  },


  get: function (resolveId) {

    return this.$store[resolveId];
  },


  store: function () {

    return xtend({}, this.$store);
  }

};


function resolveCache(options) {

  var instance;

  if (options && options.stateless) {

    instance = xtend({}, cache);
    instance.$store = {};
  }
  else {

    instance = cache;
  }

  return instance;
}
