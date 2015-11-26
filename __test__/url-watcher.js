
import { expect } from 'chai'
import { spy } from 'sinon'
import mockLocation from 'mock-location'
import urlWatcher from '../src/url-watcher'

describe('urlWatcher', () => {

  describe('history', () => {

    let window, url

    beforeEach(() => {
      window = {
        addEventListener: spy(),
        removeEventListener: spy(),
        history: {
          pushState: spy(),
          replaceState: spy()
        },
        location: mockLocation('http://www.example.com/foo?bar=baz%20qux')
      }
      url = urlWatcher(window)
    })

    describe('.get()', () => {

      it('retrieves the current url', () => {
        expect(url.get()).to.equal('/foo?bar=baz qux')
      })

    })

    describe('.subscribe(onChange)', () => {

      it('takes and calls an observer', () => {
        const changeSpy = spy()
        url.subscribe(changeSpy)
        expect(changeSpy.calledOnce).to.equal(true)
        expect(changeSpy).to.have.been.calledWith('/foo?bar=baz qux')
        url.listener()
        expect(changeSpy.calledTwice).to.equal(true)
        expect(changeSpy).to.have.been.calledWith('/foo?bar=baz qux')
      })

    })

    describe('.push(url)', () => {

      it('should push a url onto the window history', () => {
        url.push('/grault/garply')
        expect(window.history.pushState)
          .to.have.been.calledWithExactly({}, null, '/grault/garply')
      })

    })

    describe('.replace(url)', () => {

      it('should push a url onto the window history', () => {
        url.replace('/grault/garply')
        expect(window.history.replaceState)
          .to.have.been.calledWithExactly({}, null, '/grault/garply')
      })

    })

  })

  describe('hash', () => {

    var window, url

    beforeEach(() => {
      window = {
        addEventListener: spy(),
        removeEventListener: spy(),
        location: mockLocation('http://www.example.com/#/foo?bar=baz%20qux')
      }
      url = urlWatcher(window)
    })

    describe('.get()', () => {

      it('should retrieve the current url', () => {
        expect(url.get()).to.equal('/foo?bar=baz qux')
      })

      it('should retrieve the current url', () => {
        window.location.hash = ''
        expect(url.get()).to.equal('/')
      })

    })

    describe('.push(url)', () => {

      it('should set the location hash', () => {
        url.push('/grault/garply')
        expect(window.location.hash).to.equal('#/grault/garply')
      })

    })

    describe('.replace(url)', () => {

      it('should push a url onto the window history', () => {
        spy(window.location, 'replace')
        url.replace('/grault/garply')
        expect(window.location.replace)
          .to.have.been
          .calledWithExactly('http://www.example.com/#/grault/garply')
      })

    })

  })

})
