
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var mockLocation = require('mock-location');

chai.use(sinonChai);


var routerFactory = require('../modules/router');
var Route = require('../modules/Route');


describe('router', function () {

  describe('.add(name, pathSegments, querySegment)', function () {

    var window = { history: {} };
    var router;

    beforeEach(function () {

      router = routerFactory(window);
    });

    it('should register routes', function () {

      var route = router.add('foo', ['foo'], []);

      expect(router.routes.foo instanceof Route).to.equal(true);
      expect(router.routesByLength['1']).to.deep.equal([route]);
    });

  });


  describe('.findRoute(routeString)', function () {

    var window, router;

    beforeEach(function () {
      window = { history: {} };
      router = routerFactory(window);
    });


    it('should find a route', function () {

      router.add('foo', ['foo', ':bar'], []);
      expect(router.findRoute('/foo/1'))
          .to.deep.equal(['foo', { bar: '1' }]);
    });


    it('should merge path and query params', function () {

      router.add('foo', ['foo', ':bar'], ['baz']);
      expect(router.findRoute('/foo/1?baz=qux'))
        .to.deep.equal([ 'foo', { bar: '1', baz: 'qux' }]);
    });


    it('should return nothing if route is not found', function () {

      expect(router.findRoute('/hype')).to.equal(null);
    });

  });


  describe('.href(routeName, params)', function () {

    var window = { history: {} };
    var router;

    beforeEach(function () {

      router = routerFactory(window);
    });


    it('should create a route string from name and params', function () {

      router.add('foo', ['foo', ':bar'], ['baz']);

      var href = router.href('foo', { bar: 1, baz: 'qux' });

      expect(href).to.equal('/foo/1?baz=qux');
    });

  });


  describe('.watchLocation()', function () {

    it('should watch for hash changes', function () {

      var window = {
        history: {},
        addEventListener: sinon.spy(),
        removeEventListener: sinon.spy()
      };
      var router = routerFactory(window);

      router.watchLocation();

      expect(window.addEventListener)
        .to.have.been.calledWithExactly('hashchange', router.sendRouteChange);

      router.ignoreLocation();

      expect(window.removeEventListener)
        .to.have.been.calledWithExactly('hashchange', router.sendRouteChange);
    });


    it('should watch for pop states', function () {

      var window = {
        history: {
          pushState: function () {}
        },
        addEventListener: sinon.spy(),
        removeEventListener: sinon.spy()
      };
      var router = routerFactory(window);

      router.watchLocation();

      expect(window.addEventListener)
        .to.have.been.calledWithExactly('popstate', router.sendRouteChange);

      router.ignoreLocation();

      expect(window.removeEventListener)
        .to.have.been.calledWithExactly('popstate', router.sendRouteChange);
    });

  });


  describe('.getUrl()', function () {

    it('should retrieve the hash from the current url', function () {

      var window = {
        history: {},
        location: mockLocation('http://www.example.com')
      };
      var router = routerFactory(window);

      expect(router.getUrl()).to.equal('/');

      window.location.hash = '/hash-route';

      expect(router.getUrl()).to.equal('/hash-route');
    });


    it('should retrieve the url after the hostname', function () {

      var window = {
        history: {
          pushState: function () {}
        },
        location: mockLocation('http://www.example.com')
      };
      var router = routerFactory(window);

      expect(router.getUrl()).to.equal('/');

      window.location.href = 'http://www.example.com/push-route';

      expect(router.getUrl()).to.equal('/push-route');
    });

  });


  describe('.setUrl(routeUrl, options)', function () {

    var location, history, window;

    beforeEach(function () {

      location = mockLocation('http://www.example.com');

      location.replace = sinon.spy();

      history = {
        pushState: sinon.spy(),
        replaceState: sinon.spy()
      };
      window = {
        history: history,
        location: location,
        addEventListener: sinon.spy(),
        removeEventListener: sinon.spy()
      };
    });

    it('should not replace the history entry', function () {

      var router = routerFactory(window);

      router.setUrl('/foo-route');

      expect(history.replaceState.called).to.equal(false);
      expect(history.pushState)
        .to.have.been.calledWithExactly({}, null, '/foo-route');
    });


    it('should replace the history entry', function () {

      var router = routerFactory(window);

      router.setUrl('/foo-route', { replace: true });

      expect(history.replaceState.called).to.equal(true);
      expect(history.replaceState)
        .to.have.been.calledWithExactly({}, null, '/foo-route');
    });


    it('should silently change the location hash', function () {

      history.pushState = undefined;

      var router = routerFactory(window);

      router.setUrl('/foo-route');

      expect(location.replace.called).to.equal(false);
      expect(location.hash).to.equal('#/foo-route');
      expect(window.removeEventListener.calledOnce).to.equal(true);
      expect(window.addEventListener.calledOnce).to.equal(true);
    });


    it('should silently replace the location history', function () {

      history.pushState = undefined;

      var router = routerFactory(window);

      router.setUrl('/foo-route', { replace: true });

      expect(location.replace)
        .to.have.been.calledWithExactly('http://www.example.com/#/foo-route');
      expect(window.removeEventListener.calledOnce).to.equal(true);
      expect(window.addEventListener.calledOnce).to.equal(true);
    });

  });


  describe('.start(onChange)', function () {

    var location, history, window;

    beforeEach(function () {

      location = mockLocation('http://www.example.com');

      location.replace = sinon.spy();

      history = {
        pushState: sinon.spy(),
        replaceState: sinon.spy()
      };
      window = {
        history: history,
        location: location,
        addEventListener: sinon.spy(),
        removeEventListener: sinon.spy()
      };
    });

    it('should send the initial push route and watch for changes', function () {

      var router = routerFactory(window);

      router.add('foo', ['foo', ':bar'], ['baz']);

      location.href = 'http://www.example.com/foo/42?baz=qux';

      var onChange = sinon.spy();

      router.start(onChange);

      expect(onChange)
        .to.have.been
        .calledWithExactly('foo', { bar: '42', baz: 'qux' });
      expect(window.addEventListener)
        .to.have.been.calledWithExactly('popstate', router.sendRouteChange);
    });


    it('should send the initial hash route and watch for changes', function () {

      var router = routerFactory(window, { html5: false });

      router.add('foo', ['foo', ':bar'], ['baz']);

      location.href = 'http://www.example.com/index.html/#/foo/42?baz=qux';

      var onChange = sinon.spy();

      router.start(onChange);

      expect(onChange)
        .to.have.been
        .calledWithExactly('foo', { bar: '42', baz: 'qux' });
      expect(window.addEventListener)
        .to.have.been.calledWithExactly('hashchange', router.sendRouteChange);
    });

  });

});
