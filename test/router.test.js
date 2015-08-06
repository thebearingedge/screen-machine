
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);


var routerFactory = require('../modules/router');
var Route = require('../modules/Route');


describe('routerFactory', function () {

  var machine;


  beforeEach(function () {

    machine = { transitionTo: sinon.spy() };
  });


  it('should register routes', function () {

    var router = routerFactory(machine);

    var route = router.add('foo', ['foo'], '');

    expect(route instanceof Route).to.equal(true);
    expect(router.routes.foo).to.equal(route);
    expect(router.routesByLength['1']).to.deep.equal([route]);
  });


  it('should find a route', function () {

    var router = routerFactory(machine);

    router.add('foo', ['foo', ':bar'], '');
    router.find('/foo/1');

    expect(machine.transitionTo.calledOnce).to.equal(true);
    expect(machine.transitionTo)
      .to.have.been.calledWithExactly('foo', { bar: '1' });
  });


  it('should merge query and route params', function () {

    var router = routerFactory(machine);

    router.add('foo', ['foo', ':bar'], 'baz');
    router.find('/foo/1?baz=qux');

    expect(machine.transitionTo)
      .to.have.been.calledWithExactly('foo', { bar: '1', baz: 'qux' });
  });

});
