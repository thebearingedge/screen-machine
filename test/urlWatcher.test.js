
'use strict';

import { expect } from 'chai';
import sinon from 'sinon';
import mockLocation from 'mock-location';
import urlWatcher from '../modules/urlWatcher';

describe('urlWatcher', () => {

  describe('history', () => {

    var window, url;

    beforeEach(() => {
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

    describe('.get()', () => {

      it('should retrieve the current url', () => {
        expect(url.get()).to.equal('/foo?bar=baz qux');
      });

    });

    describe('.subscribe(onChange)', () => {

      it('should take and call an observer function', () => {
        const changeSpy = sinon.spy();
        url.subscribe(changeSpy);
        expect(changeSpy.calledOnce).to.equal(true);
        expect(changeSpy).to.have.been.calledWith('/foo?bar=baz qux');
        url.listener();
        expect(changeSpy.calledTwice).to.equal(true);
        expect(changeSpy).to.have.been.calledWith('/foo?bar=baz qux');
      });

    });

    describe('.push(url)', () => {

      it('should push a url onto the window history', () => {
        url.push('/grault/garply');
        expect(window.history.pushState)
          .to.have.been.calledWithExactly({}, null, '/grault/garply');
      });

    });

    describe('.replace(url)', () => {

      it('should push a url onto the window history', () => {
        url.replace('/grault/garply');
        expect(window.history.replaceState)
          .to.have.been.calledWithExactly({}, null, '/grault/garply');
      });

    });

  });

  describe('hash', () => {

    var window, url;

    beforeEach(() => {
      window = {
        addEventListener: sinon.spy(),
        removeEventListener: sinon.spy(),
        location: mockLocation('http://www.example.com/#/foo?bar=baz%20qux')
      };
      url = urlWatcher(window);
    });

    describe('.get()', () => {

      it('should retrieve the current url', () => {
        expect(url.get()).to.equal('/foo?bar=baz qux');
      });

      it('should retrieve the current url', () => {
        window.location.hash = '';
        expect(url.get()).to.equal('/');
      });

    });

    describe('.push(url)', () => {

      it('should set the location hash', () => {
        url.push('/grault/garply');
        expect(window.location.hash).to.equal('#/grault/garply');
      });

    });

    describe('.replace(url)', () => {

      it('should push a url onto the window history', () => {
        sinon.spy(window.location, 'replace');
        url.replace('/grault/garply');
        expect(window.location.replace)
          .to.have.been
          .calledWithExactly('http://www.example.com/#/grault/garply');
      });

    });

  });

});
