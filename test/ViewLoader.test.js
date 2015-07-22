
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var jsdom = require('jsdom').jsdom;

chai.use(sinonChai);


var ViewLoader = require('../modules/ViewLoader');


describe('ViewLoader', function () {


  var loader;


  beforeEach(function () {

    loader = new ViewLoader('@');
  });


  it('should have an attribute selector', function () {

    expect(loader.selector).to.equal('sm-view[id="@"]');
  });


  describe('.attachTo(Object node) => this', function () {

    it('should hold a reference to a DOM node', function () {

      var node = {};

      loader.attachTo(node);

      expect(loader.$element).to.equal(node);
    });

  });


  describe('.attachWithin(Object node) => this', function () {

    it('should find and hold a reference to a child DOM node', function () {

      var node = jsdom('<div><sm-view id="@"></sm-view></div>');
      var smView = node.querySelector('sm-view');

      loader.attachWithin(node);

      expect(loader.$element).to.equal(smView);
    });

  });


  describe('.setDefault(Object view) => this', function () {

    it('should store a default view', function () {

      var view = {};

      loader.setDefault(view);

      expect(loader.$defaultView).to.equal(view);
    });

  });


  describe('.isLoaded() => Boolean', function () {

    it('should be "loaded" if its next view is defined', function () {

      expect(loader.isLoaded()).to.equal(false);

      loader.$nextView = {};

      expect(loader.isLoaded()).to.equal(true);

      loader.$nextView = null;

      expect(loader.isLoaded()).to.equal(true);
    });

  });


  describe('.shouldClose() => Boolean', function () {

    it('should close if its next view is `null`', function () {

      loader.$nextView = {};

      expect(loader.shouldClose()).to.equal(false);

      loader.$nextView = null;

      expect(loader.shouldClose()).to.equal(true);
    });

  });


  describe('.shouldRefresh() => Boolean', function () {

    it('should refresh if its next view is its current view', function () {

      var view = {};

      loader.$currentView = view;

      expect(loader.shouldRefresh()).to.equal(false);

      loader.$nextView = view;

      expect(loader.shouldRefresh()).to.equal(true);
    });

  });


  describe('.refresh() => this', function () {

    it('should update its current view', function () {

      loader.$currentView = { update: sinon.spy() };

      loader.refresh();

      expect(loader.$currentView.update.calledOnce).to.equal(true);
    });

  });

});
