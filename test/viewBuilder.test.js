
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var State = require('../modules/State');
var viewBuilder = require('../modules/viewBuilder');

describe('viewBuilder', function () {

  var View, ViewLoader, builder;

  beforeEach(function () {

    ViewLoader = sinon.spy();
    View = sinon.spy();
    builder = viewBuilder(View, ViewLoader);
  });

  describe('.processState(Object state) -> this', function () {

    it('should noop on a state with no view keys', function () {

       expect(ViewLoader.calledOnce).to.equal(true);

      var state = new State({ name: 'foo' });

      builder.processState(state);

      expect(View.called).to.equal(false);
      expect(ViewLoader.calledOnce).to.equal(true);
    });


    it('should build one ViewLoader per child', function () {

      var fooState = new State({ name: 'foo', component: 'foo-component' });
      var barState = new State({ name: 'foo.bar', component: 'bar-component' });
      var bazState = new State({ name: 'foo.baz', component: 'baz-component' });

      expect(ViewLoader.calledOnce).to.equal(true);

      builder.processState(fooState);

      expect(ViewLoader.calledOnce).to.equal(true);
      expect(fooState.$viewLoaders).to.equal(null);

      builder.processState(barState);

      expect(ViewLoader.calledTwice).to.equal(true);
      expect(fooState.$viewLoaders.length).to.equal(1);

      builder.processState(bazState);

      expect(ViewLoader.calledTwice).to.equal(true);
      expect(fooState.$viewLoaders[1]).to.equal(undefined);
    });


    it('should add a componet view and preload view to a state', function () {

      var fooState = new State({
        name: 'foo',
        component: 'foo-component',
        preload: 'foo-child'
      });

      expect(fooState.$views).to.equal(null);
      expect(fooState.$viewLoaders).to.equal(null);

      builder.processState(fooState);

      expect(View.calledTwice).to.equal(true);
      expect(fooState.$views.length).to.equal(2);
    });


  });

});
