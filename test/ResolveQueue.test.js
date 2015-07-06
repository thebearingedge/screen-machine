'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;

chai.use(sinonChai);
chai.use(chaiAsPromised);

var ResolveQueue = require('../ResolveQueue');
ResolveQueue.Promise = require('native-promise-only');

describe('ResolveQueue', function () {

  var resolves, queue;


  describe('._executeAsPromise', function () {

    beforeEach(function () {

      resolves = [];
      queue = new ResolveQueue(resolves);
    });


    it('should return a thennable', function () {

      var resolve = {
        execute: function () {

          return Promise.resolve(42);
        }
      };
      var resolvePromise = queue._executeAsPromise(resolve);

      return Promise.all([
        expect(resolvePromise).to.eventually.equal(42)
      ]);
    });


    it('should return a catchable', function () {

      var resolve = {
        execute: function () {

          throw new Error('oops');
        }
      };
      var resolvePromise = queue._executeAsPromise(resolve);

      return Promise.all([
        expect(resolvePromise).to.eventually.be.rejectedWith(Error, 'oops')
      ]);
    });

  });

});