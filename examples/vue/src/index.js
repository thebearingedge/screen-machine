
'use strict';

/* global -document */
/* global -Promise */
var document = require('global/document');
var Vue = require('vue/dist/vue.min.js');
var screenMachine = require('../../../screenMachine');
var vueComponent = require('../../../vueComponent');
var EventEmitter = require('events').EventEmitter;
var NativePromise = require('native-promise-only');
var emitter = new EventEmitter();


var config = {
  components: vueComponent(Vue),
  document: document,
  promises: NativePromise,
  events: {
    emitter: emitter,
    trigger: 'emit',
    on: 'addListener',
    off: 'removeListener'
  }
};

require('./vues')(Vue);

var machine = global.machine = screenMachine(config);


var domready = require('domready');
var homeScreen = require('./screens/home');
var viewLibs = require('./screens/viewLibs');
var notFound = require('./screens/notFound');

homeScreen(machine);
viewLibs(machine);
notFound(machine);

domready(function () {

  machine.start();
});
