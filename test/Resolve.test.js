
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var Promise = require('native-promise-only');

var Resolve = require('../Resolve');
var StateNode = require('../StateNode');


beforeEach(function () {

  var fooState = new StateNode('foo', {
    paramKeys: ['fooParam'],
    resolve: {
      foo1: function (params) {
        return params[fooParam];
      },
      foo2: ['foo1', function (foo1, params) {

      }]
    }
  });

});

describe('Resolve(state)', function () {




});