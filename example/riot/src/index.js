
'use strict';

/* global -document */
var document = require('global/document');
var console = require('console-browserify');
var riot = global.riot = require('riot');
var screenMachine = require('../../../ScreenMachine');
var riotComponent = require('../../../riotComponent');
var EventEmitter = require('events').EventEmitter;
var Bluebird = require('bluebird');
var emitter = new EventEmitter();


emitter.on('stateChangeStart', function (transition) {

  console.log(transition.to.name);
});

var config = {
  components: riotComponent(riot),
  document: document,
  promises: Bluebird,
  events: {
    emitter: emitter,
    trigger: 'emit'
  }
};

var machine = global.machine = screenMachine(config);

require('./tags');

var domready = require('domready');
var homeScreen = require('./screens/home');
var viewsScreen = require('./screens/views');

homeScreen(machine);
viewsScreen(machine);

domready(function () {

  machine.start();
});
