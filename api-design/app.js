
'use strict';

var domready = require('domready');
var machine = require('./machine');
var customersScreen = require('./screens/customers');

customersScreen(machine);

domready(function () {

  machine.start();
});
