
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var jsdom = require('jsdom').jsdom;

chai.use(sinonChai);


var ViewLoader = require('../modules/ViewLoader');
var domNode = jsdom('<div><sm-view id="app"></sm-view></div>');


describe('ViewLoader', function () {

  var loader, nextView, nextContent;

  beforeEach(function () {

    loader = new ViewLoader('app');
  });


  it('should have an id selector', function () {

    expect(loader.selector).to.equal('#app');
  });


  it('should have a tag selector', function () {

    expect(new ViewLoader().selector).to.equal('sm-view');
  });


  describe('.attachTo(Object node) -> this', function () {

    it('should hold a reference to a DOM node', function () {

      var node = {};

      loader.attachTo(node);

      expect(loader.$element).to.equal(node);
    });

  });


  describe('.attachWithin(Object node) -> this', function () {

    it('should find and hold a reference to a child DOM node', function () {

      var smView = domNode.querySelector('#app');

      loader.attachWithin(domNode);

      expect(loader.$element).to.equal(smView);
    });

  });


  describe('.isLoaded() -> Boolean', function () {

    it('should be "loaded" if its next view is defined', function () {

      expect(loader.isLoaded()).to.equal(false);

      loader.$nextView = {};

      expect(loader.isLoaded()).to.equal(true);

      loader.$nextView = null;

      expect(loader.isLoaded()).to.equal(true);
    });

  });


  describe('.shouldClose() -> Boolean', function () {

    it('should close if its next view is `null`', function () {

      loader.$nextView = {};

      expect(loader.shouldClose()).to.equal(false);

      loader.$nextView = null;

      expect(loader.shouldClose()).to.equal(true);
    });

  });


  describe('.shouldRefresh() -> Boolean', function () {

    it('should refresh if its next view is its current view', function () {

      var view = {};

      loader.$view = view;

      expect(loader.shouldRefresh()).to.equal(false);

      loader.$nextView = view;

      expect(loader.shouldRefresh()).to.equal(true);
    });

  });


  describe('.refresh() -> this', function () {

    it('should update its current view', function () {

      loader.$view = { update: sinon.spy() };

      loader.refresh();

      expect(loader.$view.update.calledOnce).to.equal(true);
    });

  });


  beforeEach(function () {

    nextContent = {};

    nextView = {
      render: function () { return nextContent; }
    };

  });


  describe('.renderNextContent() -> this', function () {

    it('should get next content from the next view', function () {

      expect(loader.$nextContent).to.equal(undefined);

      loader.$nextView = nextView;

      loader.renderNextContent();

      expect(loader.$nextContent).to.equal(nextContent);
    });

    it('should not get next content if current view is next', function () {

      expect(loader.$nextContent).to.equal(undefined);

      var content = {};

      loader.$content = content;
      loader.$view = nextView;
      loader.$nextView = nextView;

      loader.renderNextContent();

      expect(loader.$nextContent).to.equal(undefined);
    });

  });


  describe('.loadView(Object view) -> this', function () {

    var renderNextContent;


    beforeEach(function () {

      renderNextContent = sinon.stub(loader, 'renderNextContent');
    });


    it('should not load another view', function () {

      loader.$nextView = nextView;

      loader.loadView({});

      expect(loader.$nextView).to.equal(nextView);
      expect(renderNextContent.called).to.equal(false);
    });


    it('should load the next view and render it', function () {

      loader.loadView(nextView);

      expect(loader.$nextView).to.equal(nextView);
      expect(renderNextContent.calledOnce).to.equal(true);
    });

  });


  describe('.publish() -> this', function () {

    it('should do nothing', function () {

      expect(loader.publish()).to.be.ok;
    });


    it('should refresh its view', function () {

      sinon.stub(loader, 'isActive').returns(true);
      sinon.stub(loader, 'shouldRefresh').returns(true);

      var refresh = sinon.stub(loader, 'refresh');
      loader.publish();

      expect(refresh.calledOnce).to.equal(true);
    });


    it('should close itself', function () {

      sinon.stub(loader, 'isActive').returns(true);
      sinon.stub(loader, 'shouldRefresh').returns(false);
      sinon.stub(loader, 'shouldClose').returns(true);

      var close = sinon.stub(loader, 'close');

      loader.publish();

      expect(close.calledOnce).to.equal(true);
    });


    it('should publish its content and cycle its view', function () {

      sinon.stub(loader, 'shouldRefresh').returns(false);
      sinon.stub(loader, 'shouldClose').returns(false);

      var content = loader.$content = {};
      var nextContent = loader.$nextContent = {};

      var element = loader.$element = {

        replaceChild: sinon.spy()
      };

      var nextView = loader.$nextView = {};

      loader.publish();

      expect(element.replaceChild)
        .to.have.been.calledWithExactly(nextContent, content);

      expect(loader.$content).to.equal(nextContent);
      expect(loader.$nextContent).to.equal(undefined);

      expect(loader.$view).to.equal(nextView);
      expect(loader.$nextView).to.equal(undefined);
    });


    it('should replace its content and cycle its view', function () {

      sinon.stub(loader, 'shouldRefresh').returns(false);
      sinon.stub(loader, 'shouldClose').returns(false);

      loader.$content = null;

      var nextContent = loader.$nextContent = {};
      var nextView = loader.$nextView = {};
      var view = loader.$view = {};

      var element = loader.$element = {

        appendChild: sinon.spy()
      };

      loader.publish();

      expect(element.appendChild)
        .to.have.been.calledWithExactly(nextContent);

      expect(loader.$content).to.equal(nextContent);
      expect(loader.$nextContent).to.equal(undefined);

      expect(loader.$lastView).to.equal(view);
      expect(loader.$view).to.equal(nextView);
      expect(loader.$nextView).to.equal(undefined);
    });

  });


  describe('.close() -> this', function () {

    afterEach(function () {

      expect(loader.$view).to.equal(null);
      expect(loader.$content).to.equal(null);
      expect(loader.$nextView).to.equal(undefined);
      expect(loader.$nextContent).to.equal(undefined);
    });


    it('should remove its content', function () {

      var content = loader.$content = {};

      loader.$element = {
        removeChild: sinon.spy()
      };

      loader.close();

      expect(loader.$element.removeChild)
        .to.have.been.calledWithExactly(content);
    });


    it('should destroy its view', function () {

      var view = loader.$view = { destroy: sinon.spy() };

      loader.close();

      expect(view.destroy.calledOnce).to.equal(true);
    });

  });


  describe('.cleanUp() -> this', function () {

    afterEach(function () {

      expect(loader.$lastView).to.equal(null);
    });

    it('should do nothing if no last view', function () {

      expect(loader.cleanUp()).to.be.ok;
    });

    it('should destroy its last view', function () {

      var lastView = loader.$lastView = {
        destroy: sinon.spy()
      };

      loader.cleanUp();

      expect(lastView.destroy.calledOnce).to.equal(true);
    });

  });


  describe('.detach() -> this', function () {

    it('should close and release the DOM', function () {

      sinon.stub(loader, 'close');

      loader.$element = {};

      loader.detach();

      expect(loader.close.calledOnce).to.equal(true);
      expect(loader.$element).to.equal(null);
    });

  });

});
