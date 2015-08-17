
'use strict';

/* global -document */
/* global -Promise */
var document = require('global/document');
var riot = global.riot = require('riot');
var screenMachine = require('../../../ScreenMachine');
var riotComponent = require('../../../riotComponent');
var EventEmitter = require('events').EventEmitter;
var Promise = require('native-promise-only');
var emitter = new EventEmitter();


var config = {
  components: riotComponent(riot),
  document: document,
  promises: Promise,
  events: {
    emitter: emitter,
    trigger: 'emit'
  }
};

var machine = global.machine = screenMachine(config);

require('./tags');

var domready = require('domready');
var homeScreen = require('./screens/home');
var viewLibs = require('./screens/viewLibs');

homeScreen(machine);
viewLibs(machine);

domready(function () {

  machine.start();
});
