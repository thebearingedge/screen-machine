
'use strict';

/* global -document */
var document = require('global/document');
var domready = require('domready');
var bluebird = require('bluebird');
var myEventBus = require('my-event-bus');
var screenMachine = require('screen-machine');
var riot = require('riot');
var RiotComponent = require('screen-machine/riotView')(document, riot);
var customersScreen = require('./screens/customers');

var machine = screenMachine({
  promises: bluebird,
  events: {
    emitter: myEventBus,
    trigger: 'emit'
  },
  components: RiotComponent
});

customersScreen(machine);

domready(function () {

  machine.start();
});
