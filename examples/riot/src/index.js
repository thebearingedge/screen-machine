
'use strict';

/* global -document */
/* global -Promise */
var document = require('global/document');
var riot = global.riot = require('riot');
var screenMachine = require('../../../screenMachine');
var riotComponent = require('../../../riotComponent');
var EventEmitter = require('events').EventEmitter;
var NativePromise = require('native-promise-only');
var emitter = new EventEmitter();

var config = {
  components: riotComponent(riot),
  document: document,
  promises: NativePromise,
  events: {
    emitter: emitter,
    trigger: 'emit',
    on: 'addListener',
    off: 'removeListener'
  }
};

var machine = global.machine = screenMachine(config);

require('./tags/all');

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
