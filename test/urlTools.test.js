
'use strict';

var chai = require('chai');
var expect = chai.expect;


var urlTools = require('../modules/urlTools');


describe('urlTools', function () {

  describe('.parseUrl(rawUrl)', function () {

    it('should support routes with no query or hash', function () {

      var rawUrl = '/foo/bar%20baz';

      var urlParts = urlTools.toParts(rawUrl);

      expect(urlParts.pathname).to.equal('/foo/bar baz');
      expect(urlParts.search).to.equal(undefined);
      expect(urlParts.hash).to.equal(undefined);
    });


    it('should support routes with query', function () {

      var rawUrl = '/foo/bar%20baz?qux%20quux=grault';

      var urlParts = urlTools.toParts(rawUrl);

      expect(urlParts.pathname).to.equal('/foo/bar baz');
      expect(urlParts.search).to.equal('qux quux=grault');
      expect(urlParts.hash).to.equal(undefined);
    });


    it('should support routes with hash', function () {

      var rawUrl = '/foo/bar%20baz#qux%20quux';

      var urlParts = urlTools.toParts(rawUrl);

      expect(urlParts.pathname).to.equal('/foo/bar baz');
      expect(urlParts.search).to.equal(undefined);
      expect(urlParts.hash).to.equal('qux quux');
    });


    it('should support routes with query and hash', function () {

      var rawUrl = '/foo/bar?baz=qux#garply';

      var urlParts = urlTools.toParts(rawUrl);

      expect(urlParts.pathname).to.equal('/foo/bar');
      expect(urlParts.search).to.equal('baz=qux');
      expect(urlParts.hash).to.equal('garply');
    });

  });


  describe('.parseQuery(querystring)', function () {

    it('should return an object with keys and values', function () {

      var parsed = urlTools.parseQuery('foo=bar&baz=qux');

      expect(parsed).to.deep.equal({ foo: 'bar', baz: 'qux' });
    });

  });


  describe('.formatQuery(params)', function () {

    it('should return a querystring', function () {

      var formatted = urlTools.formatQuery({ foo: 'bar', baz: 'qux' });

      expect(formatted).to.equal('foo=bar&baz=qux');
    });

  });


  describe('.combine(pathname, search, fragment', function () {

    it('should not require search or fragment', function () {

      var combined = urlTools.combine('/foo bar/baz');

      expect(combined).to.equal('/foo bar/baz');
    });


    it('should accept an object for search', function () {

      var combined = urlTools.combine('/foo bar/baz', { grault: 'garply' });

      expect(combined).to.equal('/foo bar/baz?grault=garply');
    });


    it('should accept a hash fragment', function () {

      var combined = urlTools.combine('/foo bar/baz', null, 'qux');

      expect(combined).to.equal('/foo bar/baz#qux');
    });

  });

});