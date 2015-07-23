
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var ViewLoader = require('../modules/ViewLoader');
var State = require('../modules/State');
var riotView = require('../views/riotView');

var jsdom = require('jsdom').jsdom;
var riot = require('riot');

require('./riot-tags/simple-tag');
require('./riot-tags/parent-tag');
require('./riot-tags/nested-tag');

describe('riotView', function () {

  var document, RiotTagView;

  beforeEach(function () {

    document = global.document = jsdom();
    RiotTagView = riotView(riot, document);
  });


  afterEach(function () {

    document = global.document = undefined;
  });


  var state;
  var simpleView, parentView, nestedView;
  var simpleLoader, parentLoader, nestedLoader;
  var viewLoaders;

  beforeEach(function () {

    state = new State({ name: 'foo' });

    sinon.stub(state, 'getResolveResults').returns({ place: 'Huntington' });

    simpleLoader = new ViewLoader('simple');
    parentLoader = new ViewLoader('parent');
    nestedLoader = new ViewLoader('nested');

    viewLoaders = {
      simple: simpleLoader,
      parent: parentLoader,
      nested: nestedLoader
    };

    simpleView = new RiotTagView('simple-tag', state, 'simple', viewLoaders);
    parentView = new RiotTagView('parent-tag', state, 'parent', viewLoaders);
    nestedView = new RiotTagView('nested-tag', state, 'nested', viewLoaders);
  });


  describe('.render() -> Node', function () {

    it('should attach to and return a rendered DOM tree', function () {

      var element = simpleView.render();

      expect(element.innerHTML)
        .to.equal('<span>Welcome to Huntington</span>');
      expect(simpleView.$tag.isMounted).to.equal(true);
      expect(simpleView.$element).to.equal(element);
    });

  });


  describe('.update() -> this', function () {

    it('should update element with new opts', function () {

      var element = simpleView.render();

      state.getResolveResults.restore();

      expect(element.innerHTML)
        .to.equal('<span>Welcome to Huntington</span>');

      sinon.stub(state, 'getResolveResults').returns({ place: 'Santa Ana' });

      simpleView.update();

      expect(element.innerHTML)
        .to.equal('<span>Welcome to Santa Ana</span>');
    });

  });


  describe('.load() -> this', function () {

    it('should load into its designated viewLoader', function () {

      simpleView.load();

      expect(simpleLoader.$nextView).to.equal(simpleView);
      expect(simpleLoader.$nextContent.innerHTML)
        .to.equal('<span>Welcome to Huntington</span>');
    });

  });


  describe('.publishChildren() -> this', function () {

    it('should render publish nested views', function () {

      var element = parentView.render();

      expect(element.innerHTML)
        .to.equal(
          '<h1>Say hello to my little friend.</h1> ' +
          '<sm-view id="nested"></sm-view>'
        );

      nestedView.load();
      parentView.publishChildren();

      expect(element.innerHTML)
        .to.equal(
          '<h1>Say hello to my little friend.</h1> ' +
          '<sm-view id="nested">' +
            '<nested-tag riot-tag="nested-tag">' +
              '<p>Here\'s Johnny!</p>' +
            '</nested-tag>' +
          '</sm-view>'
        );
    });

  });


  describe('.destroy() -> this', function () {

    it('should unmount its tag and null its references', function () {

      var unmount;

      simpleView.render();

      unmount = sinon.spy(simpleView.$tag, 'unmount');

      simpleView.destroy();

      expect(unmount.calledOnce).to.equal(true);
      expect(simpleView.$element).to.equal(null);
      expect(simpleView.$children).to.equal(null);
      expect(simpleView.$tag).to.equal(null);
    });


    it('should detach its children', function () {

      var detach;

      nestedView.load();
      parentView.load();

      detach = sinon.spy(nestedLoader, 'detach');

      expect(parentView.$children.length).to.equal(1);

      parentView.destroy();

      expect(detach.calledOnce).to.equal(true);
    });

  });

});
