
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var View = require('../modules/View');


describe('View', function () {

  var viewTree, view;

  beforeEach(function () {

    viewTree = {
      activeViews: {},
      loadedViews: []
    };

    view = new View('', viewTree);
  });


  describe('.detach()', function () {

    it('should release its DOM reference', function () {

      view.domNode = {};

      view.detach();

      expect(view.domNode).to.equal(null);
    });

  });


  describe('.addComponent(stateName, component)', function () {

    it('should register a view for a state', function () {

      var component = { setView: sinon.spy() };

      view.addComponent('app', component);

      expect(view.components.app).to.equal(component);
    });

  });



  describe('.isActive()', function () {

    it('should know whether it is currently active', function () {

      viewTree.activeViews[''] = view;

      expect(view.isActive()).to.equal(true);

      viewTree.activeViews = {};

      expect(view.isActive()).to.equal(false);
    });

  });

});