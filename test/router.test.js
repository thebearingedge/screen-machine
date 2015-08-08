
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);


var routerFactory = require('../modules/router');
var Route = require('../modules/Route');


describe('routerFactory', function () {

  var machine, router;


  beforeEach(function () {

    machine = { transitionTo: sinon.spy() };
    router = routerFactory(machine);
  });


  it('should register routes', function () {

    var route = router.add('foo', ['foo'], []);

    expect(router.routes.foo instanceof Route).to.equal(true);
    expect(router.routesByLength['1']).to.deep.equal([route]);
  });


  it('should find a route', function () {

    router.add('foo', ['foo', ':bar'], []);
    expect(router.find('/foo/1'))
        .to.deep.equal({ route: 'foo', params: { bar: '1' } });
  });


  it('should merge path and query params', function () {

    router.add('foo', ['foo', ':bar'], ['baz']);
    expect(router.find('/foo/1?baz=qux'))
      .to.deep.equal({ route: 'foo', params: { bar: '1', baz: 'qux' } });
  });


  it('should create a route string from name and params', function () {

    router.add('foo', ['foo', ':bar'], ['baz']);

    var href = router.href('foo', { bar: 1, baz: 'qux' });

    expect(href).to.equal('/foo/1?baz=qux');
  });


  it('should return nothing if route is not found', function () {

    expect(router.find('/hype')).to.equal(null);
  });

});
