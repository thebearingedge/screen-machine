
'use strict';

var chai = require('chai');
var expect = chai.expect;

import Route from '../modules/Route';

describe('Route', function () {

  it('should have a specificity rating', function () {

    var route;

    route = new Route('app', '/');
    expect(route.specificity).to.equal('1');

    route = new Route('app.login', 'login');
    expect(route.specificity).to.equal('4');

    route = new Route('app.pictures.picture', 'pictures/:pictureId');
    expect(route.specificity).to.equal('43');
  });


  describe('.addChild(route)', function () {

    it('should add a child route and set itself as parent', function () {

      var parent = new Route('app', '/');
      var child = new Route('app.login', '/login');

      parent.addChild(child);

      expect(parent.children[0]).to.equal(child);
      expect(child.parent).to.equal(parent);
    });

  });


  describe('.match(pathStrings)', function () {

    it('should extract match from pathStrings', function () {

      var strings = ['profile', 'foo'];
      var route = new Route('app.login', 'profile/:username');
      var matched = route.match(strings);

      expect(matched).to.deep.equal([{}, { username: 'foo' }]);
      expect(strings.length).to.equal(0);
    });


    it('should not extract a match if path is too short', function () {

      var strings = ['pictures', 'favorites'];
      var route = new Route('app.login', 'pictures/favorites/:pictureId');
      var matched = route.match(strings);

      expect(matched).to.equal(null);
      expect(strings.length).to.equal(2);
    });


    it('should not extract a match if not all segments match', function () {

      var strings = ['pictures', '7', 'captions'];
      var route = new Route('caption', 'pictures/:pictureId/tags');
      var matched = route.match(strings);

      expect(matched).to.equal(null);
      expect(strings.length).to.equal(3);
    });


    it('should extract partial matches', function () {

      var strings = ['pictures', '7', 'captions'];
      var route = new Route('caption', 'pictures/:pictureId');
      var matched = route.match(strings);

      expect(matched).to.deep.equal([{}, { pictureId: '7' }]);
      expect(strings.length).to.equal(1);
    });


    it('should match the remaining strings with a splat', function () {

      var strings = ['feed', 'stories', '42', 'comments', '70'];
      var route = new Route('story', '*notFound');
      var matched = route.match(strings);

      expect(matched)
        .to.deep.equal([{ notFound: 'feed/stories/42/comments/70'}]);
      expect(strings.length).to.equal(0);
    });

  });


  describe('.generate(params)', function () {

    it('should return a url path', function () {

      var route = new Route('root', '/');

      var path = route.generate({});

      expect(path).to.equal('/');
    });


    it('should interpolate a url path', function () {

      var root = new Route('root', '/');
      var foo = new Route('foo', 'foo/:bar');
      var qux = new Route('qux', 'qux/:quux');

      root.addChild(foo);
      foo.addChild(qux);

      expect(foo.generate({ bar: 'baz' })).to.equal('/foo/baz');
      expect(qux.generate({ bar: 'baz', quux: 'grault' }))
        .to.equal('/foo/baz/qux/grault');
    });

  });

});