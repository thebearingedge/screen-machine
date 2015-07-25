
'use strict';

/* global -document */
var document = require('global/document');
var bluebird = require('bluebird');
var myEventBus = require('my-event-bus');

var screenMachine = require('screen-machine');

var riot = require('riot');
var RiotComponent = require('screen-machine/riotView')(document, riot);

var machine = screenMachine({
  promises: bluebird,
  events: {
    emitter: myEventBus,
    trigger: 'emit'
  },
  components: RiotComponent
});


module.exports = machine;
