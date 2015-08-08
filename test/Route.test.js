
'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);


var Route = require('../modules/Route');


describe('Route', function () {


  describe('.reverse(params)', function () {

    it('should reverse a path with no params or query', function () {

      var route = new Route('foo', ['foo'], '');

      expect(route.reverse({})).to.equal('/foo');
    });


    it('should reverse a path with params', function () {

      var route = new Route('foo', ['foo', ':bar'], '');

      expect(route.reverse({ bar: 1 })).to.equal('/foo/1');
    });


    it('should reverse a path with query params', function () {

      var route = new Route('foo', ['foo', ':bar'], 'baz');

      expect(route.reverse({ bar: 1, baz: 'qux' })).to.equal('/foo/1?baz=qux');
    });


    it('should OPTIONALLY compile a querystring', function () {

      var route = new Route('foo', ['foo', ':bar'], 'baz');

      expect(route.reverse({ bar: 1 })).to.equal('/foo/1');
    });

  });


  describe('.match(url)', function () {

    it('should create a params object with path params', function () {

      var route = new Route('foo', ['foo', ':bar'], '');

      expect(route.match('/foo/1')).to.deep.equal({ bar: '1' });
    });


    it('should not return a params object if url is not matched', function () {

      var route = new Route('foo', ['foo', ':bar'], 'baz');

      expect(route.match('/quux/1?baz=qux&grault=garpley')).to.equal(null);
    });

  });


});