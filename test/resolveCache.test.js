
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var xtend = require('xtend');
var resolveCache = require('../modules/resolveCache');


describe('resolveCache', function () {

  var cache;

  beforeEach(function () {

    cache = xtend(resolveCache);
    cache.$store = {};
  });


  describe('.set(String resolveId, <Any>)', function () {

    it('should store values', function () {

      cache.set('foo@bar', 42);

      expect(cache.$store).to.deep.equal({ 'foo@bar': 42 });
    });

  });


  describe('.unset(String resolveId) -> this', function () {

    it('should remove values', function () {

      cache.$store = { 'foo@bar': 42 };

      cache.unset('foo@bar');

      expect(cache.$store).to.deep.equal({});
    });

  });


  describe('.get(String resolveId) -> <Any>', function () {

    it('should retrieve values', function () {

      cache.$store = { 'foo@bar': 42 };

      expect(cache.get('foo@bar')).to.equal(42);
    });

  });

});