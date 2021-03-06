
import { expect } from '@thebearingedge/test-utils'
import RouteSegment from '../src/route-segment'

describe('RouteSegment', () => {

  describe('static', () => {

    let staticSegment

    beforeEach(() => {
      staticSegment = RouteSegment.create('foo')
      expect(staticSegment.type).to.equal('static')
      expect(staticSegment.specificity).to.equal('4')
      expect(staticSegment.key).to.equal('foo')
    })

    describe('.match(string)', () => {

      it('should not match a non-identical string', () => {
        expect(staticSegment.match('bar')).to.equal(null)
      })

      it('should match an identical string', () => {
        expect(staticSegment.match('foo')).to.deep.equal({})
      })

    })

    describe('.interpolate(params)', () => {

      it('should return its key', () => {
        expect(staticSegment.interpolate({})).to.equal('foo')
      })

    })

  })


  describe('dynamic', () => {

    let dynamicSegment

    beforeEach(() => {
      dynamicSegment = RouteSegment.create(':foo')
      expect(dynamicSegment.type).to.equal('dynamic')
      expect(dynamicSegment.specificity).to.equal('3')
      expect(dynamicSegment.key).to.equal('foo')
    })

    describe('.match(string)', () => {

      it('should return a key value object', () => {
        expect(dynamicSegment.match('bar')).to.deep.equal({ foo: 'bar' })
      })

      it('should convert the param type from a string', () => {
        dynamicSegment.parser = val => parseInt(val, 10)
        const interpolated = dynamicSegment.match('1')
        expect(interpolated).to.deep.equal({ foo: 1 })
      })

    })

    describe('.interpolate(params)', () => {

      it('should return the params value that matches its key', () => {
        expect(dynamicSegment.interpolate({ foo: 'bar' })).to.equal('bar')
      })

    })

  })

  describe('splat', () => {

    let splatSegment

    beforeEach(() => {
      splatSegment = RouteSegment.create('*foo')
      expect(splatSegment.type).to.equal('splat')
      expect(splatSegment.specificity).to.equal('2')
      expect(splatSegment.key).to.equal('foo')
    })

    describe('.match(string)', () => {

      it('should return a key value object', () => {
        expect(splatSegment.match('baz/qux')).to.deep.equal({ foo: 'baz/qux' })
      })

    })

    describe('.interpolate(params)', () => {

      it('should return an empty string', () => {
        expect(splatSegment.interpolate({ foo: 'bar/baz qux' })).to.equal('')
      })

    })

  })

  describe('epsilon', () => {

    let epsilonSegment

    beforeEach(() => {
      epsilonSegment = RouteSegment.create('')
      expect(epsilonSegment.type).to.equal('epsilon')
      expect(epsilonSegment.specificity).to.equal('1')
      expect(epsilonSegment.key).to.equal('')
    })

    describe('.match(string)', () => {

      it('should match identical strings', () => {
        expect(epsilonSegment.match('')).to.deep.equal({})
      })

      it('should not match non-identical strings', () => {
        expect(epsilonSegment.match('foo')).to.equal(null)
      })

    })

    describe('.interpolate(params)', () => {

      it('should only return an empty string', () => {
        expect(epsilonSegment.interpolate({})).to.equal('')
      })

    })

  })

})
