
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var State = require('../modules/State');
var viewBuilder = require('../modules/viewBuilder');

describe('viewBuilder', function () {

  var View, builder;

  beforeEach(function () {

    View = sinon.spy();
    builder = viewBuilder(View);
  });

  describe('.processState(Object state) -> this', function () {

    it('should noop on a state with no view keys', function () {

      var state = new State({ name: 'foo' });

      builder.processState(state);

      expect(View.called).to.equal(false);
      expect(builder.viewLoaders.foo).to.equal(undefined);
    });


    it('should build one ViewLoader for all children', function () {

      var fooState = new State({ name: 'foo', component: 'foo-component' });
      var barState = new State({ name: 'foo.bar', component: 'bar-component' });
      var bazState = new State({ name: 'foo.baz', component: 'baz-component' });

      builder.processState(fooState);

      expect(builder.viewLoaders.foo).to.equal(undefined);
      expect(fooState.$viewLoaders).to.equal(null);

      builder.processState(barState);

      var fooLoader = fooState.$viewLoaders[0];

      builder.processState(bazState);

      expect(fooState.$viewLoaders[1]).to.equal(undefined);
      expect(fooState.$viewLoaders[0]).to.equal(fooLoader);
      expect(builder.viewLoaders.foo).to.equal(fooLoader);
    });


    it('should add a componet view and preload view to a state', function () {

      var fooState = new State({
        name: 'foo',
        component: 'foo-component',
        preload: 'foo-child'
      });

      expect(fooState.$views).to.equal(null);

      builder.processState(fooState);

      expect(View.calledTwice).to.equal(true);
      expect(fooState.$views.length).to.equal(2);
    });

  });

});
