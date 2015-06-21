
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var Transition = require('../Transition');
var Promise = require('native-promise-only');
var EventEmitter = require('events').EventEmitter;

describe('Transition', function () {

  var transition, emitter;

  it('should instantiate itself', function () {
    // jshint newcap: false
    expect(Transition() instanceof Transition).to.equal(true);
  });


  beforeEach(function () {

    emitter = new EventEmitter();

    var from = {},
        to = {},
        params = {},
        deps = { emit: emitter, promise: Promise };

    var transition = new Transition(from, to, params, deps);

  });

});