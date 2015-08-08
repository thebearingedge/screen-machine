
'use strict';

/* global -document */
var document = require('global/document');
var domready = require('domready');
var bluebird = require('bluebird');
var myEventBus = require('my-event-bus');
var screenMachine = require('screen-machine');
var riot = require('riot');
var riotComponent = require('screen-machine/riotComponent')(riot);
var customersScreen = require('./screens/customers');

var machine = screenMachine({
  document: document,
  promises: bluebird,
  events: {
    emitter: myEventBus,
    trigger: 'emit'
  },
  components: riotComponent
});

customersScreen(machine);

domready(function () {

  machine.start();
});
