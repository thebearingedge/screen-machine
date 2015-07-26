
'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);


var stateRegistry = require('../modules/stateRegistry');
var State = require('../modules/State');


describe('stateRegistry', function () {

  var registry, viewService, resolveService, rootState;

  beforeEach(function () {

    viewService = {
      viewports: {
        '': {}
      },
      buildViewsFor: function () {}
    };

    resolveService = {
      addResolvesTo: function () {}
    };

    registry = stateRegistry(viewService, resolveService);
    rootState = registry.root;
  });


  describe('.add(String stateName, Object definition) -> this', function () {

    it('should create and register a State', function () {

      registry.add('foo', {});

      var fooState = registry.states.foo;
      expect(fooState instanceof State).to.equal(true);
      expect(fooState.$parent).to.equal(rootState);
    });


    it('should accept an object definition with a name property', function () {

      registry.add({ name: 'foo' });

      var fooState = registry.states.foo;
      expect(fooState instanceof State).to.equal(true);
      expect(fooState.$parent).to.equal(rootState);
    });


    it('should enqueue a state with a lazy parent', function () {

      registry.add('foo.bar', {});

      var barState = registry.queues.foo[0];

      expect(barState.$parent).to.equal(null);
      expect(registry.states['foo.bar']).to.equal(undefined);
      expect(barState instanceof State).to.equal(true);
    });


    it('should throw if state name is invalid', function () {

      expect(registry.add.bind(registry, {}))
        .to.throw(Error, 'State definitions must include a string name');
    });


    it('should dequeue states that were queued', function () {

      registry.add('foo.bar', {});
      registry.add('foo.bar.baz', {});

      var barState = registry.queues.foo[0];
      var bazState = registry.queues['foo.bar'][0];

      expect(barState.$parent).to.equal(null);
      expect(bazState.$parent).to.equal(null);

      registry.add('foo', {});

      var fooState = registry.states.foo;

      expect(registry.queues.foo.length).to.equal(0);
      expect(registry.queues['foo.bar'].length).to.equal(0);
      expect(registry.states['foo.bar']).to.equal(barState);
      expect(registry.states['foo.bar.baz']).to.equal(bazState);
      expect(barState.$parent).to.equal(fooState);
      expect(bazState.$parent).to.equal(barState);
    });

  });

});
