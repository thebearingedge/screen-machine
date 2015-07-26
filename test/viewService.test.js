
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var State = require('../modules/State');
var viewService = require('../modules/viewService');

describe('viewService', function () {

  var View, service;

  beforeEach(function () {

    View = sinon.spy();
    service = viewService(View);
  });

  describe('.buildViewsFor(Object state) -> this', function () {

    it('should noop on a state with no view keys', function () {

      var state = new State({ name: 'foo' });

      service.buildViewsFor(state);

      expect(View.called).to.equal(false);
      expect(service.viewports.foo).to.equal(undefined);
    });


    it('should build one ViewLoader for all children', function () {

      var fooState = new State({ name: 'foo', component: 'foo-component' });
      var barState = new State({ name: 'foo.bar', component: 'bar-component' });
      var bazState = new State({ name: 'foo.baz', component: 'baz-component' });

      service.buildViewsFor(fooState);

      expect(service.viewports.foo).to.equal(undefined);
      expect(fooState.$viewports).to.equal(null);

      service.buildViewsFor(barState);

      var fooLoader = fooState.$viewports[0];

      service.buildViewsFor(bazState);

      expect(fooState.$viewports[1]).to.equal(undefined);
      expect(fooState.$viewports[0]).to.equal(fooLoader);
      expect(service.viewports.foo).to.equal(fooLoader);
    });


    it('should add a componet view and preload view to a state', function () {

      var fooState = new State({
        name: 'foo',
        component: 'foo-component',
        preload: 'foo-child'
      });

      expect(fooState.$views).to.equal(null);

      service.buildViewsFor(fooState);

      expect(View.calledTwice).to.equal(true);
      expect(fooState.$views.length).to.equal(2);
    });

  });

});
