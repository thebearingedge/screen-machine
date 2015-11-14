
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;


var mockLocation = require('mock-location');
var urlWatcher = require('../modules/urlWatcher');


describe('urlWatcher', function () {


  describe('history', function () {

    var window, url;

    beforeEach(function () {
      window = {
        addEventListener: sinon.spy(),
        removeEventListener: sinon.spy(),
        history: {
          pushState: sinon.spy(),
          replaceState: sinon.spy()
        },
        location: mockLocation('http://www.example.com/foo?bar=baz%20qux')
      };

      url = urlWatcher(window);
    });


    describe('.get()', function () {

      it('should retrieve the current url', function () {

        expect(url.get()).to.equal('/foo?bar=baz qux');
      });

    });


    describe('.subscribe(onChange)', function () {

      it('should take and call an observer function', function () {

        var changeSpy = sinon.spy();

        url.subscribe(changeSpy);

        expect(changeSpy.calledOnce).to.equal(true);
        expect(changeSpy).to.have.been.calledWith('/foo?bar=baz qux');

        url.listener();

        expect(changeSpy.calledTwice).to.equal(true);
        expect(changeSpy).to.have.been.calledWith('/foo?bar=baz qux');
      });

    });


    describe('.push(url)', function () {

      it('should push a url onto the window history', function () {

        url.push('/grault/garply');

        expect(window.history.pushState)
          .to.have.been.calledWithExactly({}, null, '/grault/garply');
      });

    });


    describe('.replace(url)', function () {

      it('should push a url onto the window history', function () {

        url.replace('/grault/garply');

        expect(window.history.replaceState)
          .to.have.been.calledWithExactly({}, null, '/grault/garply');
      });

    });

  });


  describe('hash', function () {

    var window, url;

    beforeEach(function () {
      window = {
        addEventListener: sinon.spy(),
        removeEventListener: sinon.spy(),
        location: mockLocation('http://www.example.com/#/foo?bar=baz%20qux')
      };

      url = urlWatcher(window);
    });


    describe('.get()', function () {

      it('should retrieve the current url', function () {

        expect(url.get()).to.equal('/foo?bar=baz qux');
      });


      it('should retrieve the current url', function () {

        window.location.hash = '';
        expect(url.get()).to.equal('/');
      });

    });


    describe('.push(url)', function () {

      it('should set the location hash', function () {

        url.push('/grault/garply');

        expect(window.location.hash).to.equal('#/grault/garply');
      });

    });


    describe('.replace(url)', function () {

      it('should push a url onto the window history', function () {

        sinon.spy(window.location, 'replace');

        url.replace('/grault/garply');

        expect(window.location.replace)
          .to.have.been
          .calledWithExactly('http://www.example.com/#/grault/garply');
      });

    });

  });

});
