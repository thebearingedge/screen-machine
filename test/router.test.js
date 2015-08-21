
'use strict';

var chai = require('chai');
var expect = chai.expect;


var routerFactory = require('../modules/router');

describe('router', function () {

  describe('.add(name, path)', function () {

    var router;

    beforeEach(function () {

      router = routerFactory();
    });

    it('should register routes', function () {

      var appRoute = router.add('app', '/');

      expect(appRoute).to.equal(router.root);

      var photosRoute = router.add('app.photos', 'photos');

      expect(photosRoute.parent).to.equal(appRoute);
      expect(appRoute.children[0]).to.equal(photosRoute);

      var loginRoute = router.add('app.login', 'login');

      expect(loginRoute.parent).to.equal(appRoute);
      expect(appRoute.children[1]).to.equal(loginRoute);

      var landingRoute = router.add('landing', 'landing');

      expect(landingRoute.parent).to.equal(appRoute);
      expect(appRoute.children[2]).to.equal(landingRoute);
    });

  });


  describe('.href(name, params, query, fragment)', function () {

    var router;

    beforeEach(function () {

      router = routerFactory();

      router.add('app', '/');
      router.add('app.users', 'users');
      router.add('app.users.profile', ':userId');
      router.add('landing', '/landing');
      router.add('landing.about', '/about');
    });


    it('should compile absolute routes', function () {

      var href = router.href('landing');

      expect(href).to.equal('/landing');
    });


    it('should compile reset absolute routes', function () {

      var href = router.href('landing.about');

      expect(href).to.equal('/about');
    });


    it('should compile routes with params', function () {

      var href = router.href('app.users.profile', { userId: '7' });

      expect(href).to.equal('/users/7');
    });


    it('should compile routes with queries', function () {

      var href = router.href('app', {}, { foo: 'bar' });

      expect(href).to.equal('/?foo=bar');
    });


    it('should compile routes with fragments', function () {

      var href = router.href('app.users', {}, {}, 'howdy');

      expect(href).to.equal('/users#howdy');
    });


    it('should compile complex routes', function () {

      var href = router
        .href('app.users.profile', { userId: '7' }, { foo: 'bar' }, 'howdy');

      expect(href).to.equal('/users/7?foo=bar#howdy');
    });

  });


  describe('.find(path)', function () {

    var router;

    beforeEach(function () {

      router = routerFactory();

      router.add('app.users', 'users');
      router.add('landing', '/landing');
      router.add('app.login', 'login');
      router.add('app', '/');
      router.add('app.users.profile', ':userId');
      router.add('app.users.profile.notFound', '*notFound');
      router.add('app.users.search', 'search');
      router.add('app.users.profile.friends', 'friends');
      router.add('landing.about', '/about');
    });


    it('should find a route', function () {

      expect(router.routes['landing.about']).to.be.ok;

      expect(router.find('/?foo=bar'))
        .to.deep.equal(['app', {}, { foo: 'bar' }]);
      expect(router.find('/login')).to.deep.equal(['app.login', {}, {}]);
      expect(router.find('/users')).to.deep.equal(['app.users', {}, {}]);
      expect(router.find('/landing')).to.deep.equal(['landing', {}, {}]);
      expect(router.find('/about'))
        .to.deep.equal(['landing.about', {}, {}]);
    });


    it('should find a static route first', function () {

      expect(router.find('/users/search'))
        .to.deep.equal(['app.users.search', {}, {}]);
    });


    it('should find a dynamic route second', function () {

      expect(router.find('/users/7'))
        .to.deep.equal(['app.users.profile', { userId: '7' }, {}]);
    });


    it('should find a splat route', function () {

      expect(router.find('/users/7/so/cool'))
        .to.deep.equal([
          'app.users.profile.notFound',
          { userId: '7', notFound: 'so/cool' },
          {}
        ]);
    });


    it('should find a static nested route before a splat route', function () {

      expect(router.find('/users/7/friends'))
        .to.deep.equal(['app.users.profile.friends', { userId: '7' }, {}]);
    });


    it('should not find a route that doesn\'t exist', function () {

      expect(router.find('/some/crazy/garbage')).to.equal(null);
    });

  });

});
