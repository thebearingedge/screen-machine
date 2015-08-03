
'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);


var resolveCache = require('../modules/resolveCache');

describe('resolveCache', function () {

  var cache;

  it('should be a singleton', function () {

    var first = resolveCache();
    var second = resolveCache();

    expect(first).to.equal(second);
  });


  it('should be a factory', function () {

    var first = resolveCache({ stateless: true });
    var second = resolveCache({ stateless: true });

    expect(first).not.to.equal(second);
    expect(first.$store).not.to.equal(second.$store);
  });

  beforeEach(function () {

    cache = resolveCache({ stateless: true });
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