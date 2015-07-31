
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);


var State = require('../modules/State');
var resolveCache = require('../modules/resolveCache');


describe('State', function () {

  var state;

  it('should establish its parent\'s name', function () {

    state = new State({ name: 'foo' });
    expect(state.parent).to.equal(null);

    state = new State({ name: 'foo.bar' });
    expect(state.parent).to.equal('foo');

    state = new State({ name: 'foo.bar.baz' });
    expect(state.parent).to.equal('foo.bar');

    state = new State({ name: 'bar', parent: 'foo' });
    expect(state.parent).to.equal('foo');
  });


  beforeEach(function () {

    state = new State({ name: 'foo' });
  });


  describe('.contains(Object state) => Boolean', function () {

    it('should know whether it contains another state', function () {

      expect(state.contains(state)).to.equal(true);
      expect(state.contains({ name: 'baz' })).to.equal(false);
    });

  });


  describe('.getBranch() => Array<State>', function () {

    it('should retreive its ancestor States', function () {

      expect(state.getBranch()[0]).to.equal(state);
    });

  });


  describe('.addView(Object viewLoader) => this', function () {

    it('should store views', function () {

      expect(state.$views).to.equal(null);

      state.addView({});

      expect(state.$views.length).to.equal(1);
    });

  });


  describe('.getViews() => Array<ViewLoader>', function () {

    it('should return its views', function () {

      expect(state.getViews()).to.deep.equal([]);

      var fakeLoader = {};

      state.$views = [fakeLoader];

      expect(state.getViews()[0]).to.equal(fakeLoader);
    });

  });


  describe('.addComponent(Object view) => this', function () {

    it('should store views', function () {

      expect(state.$components).to.equal(null);

      state.addComponent({});

      expect(state.$components.length).to.equal(1);
    });

  });


  describe('.getComponents() => Array<View>', function () {

    it('should return its views', function () {

      expect(state.getComponents()).to.deep.equal([]);

      var fakeView = {};

      state.$components = [fakeView];

      expect(state.getComponents()[0]).to.equal(fakeView);
    });

  });


  describe('.getParent() => State', function () {

    it('should return its parent State', function () {

      var fakeParent = {};

      state.$parent = fakeParent;

      expect(state.getParent()).to.equal(fakeParent);
    });

  });


  describe('.addResolve(Object resolve) => this', function () {

    it('should store resolves', function () {

      expect(state.$resolves).to.equal(null);

      var fakeResolve = {};

      state.addResolve(fakeResolve);

      expect(state.$resolves.length).to.equal(1);
    });

  });


  describe('.getResolves() => Array<Resolve>', function () {

    it('should return its resolves', function () {

      expect(state.getResolves()).to.deep.equal([]);

      var fakeResolve = {};

      state.$resolves = [fakeResolve];

      expect(state.getResolves()[0]).to.equal(fakeResolve);
    });

  });


  describe('.getResolveResults(cache) => Object', function () {

    it('should aggregate results from its resolves', function () {

      var fooResolve = {
        id: 'foo@state',
        key: 'foo'
      };
      var bazResolve = {
        id: 'baz@state',
        key: 'baz'
      };
      var cache = resolveCache({ stateless: true });

      cache.$store = {
        'foo@state': 'bar',
        'baz@state': 'qux'
      };

      state.$resolves = [fooResolve, bazResolve];

      expect(state.getResolveResults(cache))
        .to.deep.equal({ foo: 'bar', baz: 'qux'});
    });

  });


  describe('.addParamKeys(Array<String>) => this', function () {

    it('should store paramKeys', function () {

      expect(state.$paramKeys).to.equal(null);

      var keys = ['foo', 'bar', 'baz'];

      state.addParamKeys(keys);

      expect(state.$paramKeys.length).to.equal(3);

      state.$paramKeys = [];

      state.addParamKeys(['foo']);

      expect(state.$paramKeys.length).to.equal(1);
    });

  });


  describe('.filterParams(Object params) => Object', function () {

    it('should return params filtered by $paramKeys', function () {

      state.$paramKeys = ['foo', 'bar'];

      var allParams = { foo: 1, bar: 2, baz: 3 };

      expect(state.filterParams(allParams)).to.deep.equal({ foo: 1, bar: 2 });
    });

  });


  describe('.cacheParams(Object params) => this', function () {

    it('should cache params filtered by $paramKeys', function () {

      state.$paramKeys = ['foo', 'bar'];

      var allParams = { foo: 1, bar: 2, baz: 3 };

      state.cacheParams(allParams);

      expect(state.$paramCache).to.deep.equal({ foo: 1, bar: 2 });
    });

  });


  describe('.sleep() => this', function () {

    it('should reset views, resolves and $paramCache', function () {

      var viewLoader = { detach: sinon.spy() };
      var resolve = { clearCache: sinon.spy() };

      state.$views = [viewLoader];
      state.$resolves = [resolve];
      state.$paramCache = {};

      state.sleep();

      expect(viewLoader.detach.calledOnce).to.equal(true);
      expect(resolve.clearCache.calledOnce).to.equal(true);
      expect(state.$paramCache).to.equal(null);
    });

  });


  describe('.isStale(Object params) => Boolean', function () {

    it('should not be true without resolves to run', function () {

      var params = {};

      expect(state.isStale(params)).to.equal(false);
    });


    it('should be true with resolves but no cached params', function () {

      var resolve = {};
      var params = {};

      state.$resolves = [resolve];

      expect(state.isStale(params)).to.equal(true);
    });


    it('should compare newParams to paramCache', function () {

      var resolve = {};
      var newParams = { foo: 2 };

      state.$resolves = [resolve];
      state.$paramKeys = ['foo'];
      state.$paramCache = { foo: 1 };

      expect(state.isStale(newParams)).to.equal(true);

      state.$paramCache = { foo: 2 };

      expect(state.isStale(newParams)).to.equal(false);
    });

  });


  describe('.inheritFrom(Object state) => this', function () {

    var foo, bar;

    beforeEach(function () {

      foo = new State({
        name: 'foo',
        data: { isCool: true }
      });

      foo.$paramKeys = ['baz'];

      bar = new State({
        name: 'bar',
        data: { isGood: true }
      });

      bar.$paramKeys = ['qux'];

    });

    it('should extend parent state properties', function () {

      bar.inheritFrom(foo);

      expect(bar.data).to.deep.equal({ isCool: true, isGood: true });
      expect(bar.$includes.foo).to.equal(true);
      expect(bar.$paramKeys.length).to.equal(2);
      expect(bar.$paramKeys).to.include('baz', 'qux');
      expect(bar.$branch[0]).to.equal(foo);
      expect(bar.$parent).to.equal(foo);
    });


    it('should always extend parent data', function () {

      bar.data = null;

      bar.inheritFrom(foo);

      expect(bar.data).to.deep.equal(foo.data);
    });

  });

});
