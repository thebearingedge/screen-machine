
import { expect } from 'chai'
import urlTools from '../modules/urlTools'

describe('urlTools', () => {

  describe('.parseUrl(rawUrl)', () => {

    it('should support routes with no query or hash', () => {
      const rawUrl = '/foo/bar%20baz'
      const urlParts = urlTools.toParts(rawUrl)
      expect(urlParts.pathname).to.equal('/foo/bar baz')
      expect(urlParts.search).to.equal(undefined)
      expect(urlParts.hash).to.equal(undefined)
    })

    it('should support routes with query', () => {
      const rawUrl = '/foo/bar%20baz?qux%20quux=grault'
      const urlParts = urlTools.toParts(rawUrl)
      expect(urlParts.pathname).to.equal('/foo/bar baz')
      expect(urlParts.search).to.equal('qux quux=grault')
      expect(urlParts.hash).to.equal(undefined)
    })

    it('should support routes with hash', () => {
      const rawUrl = '/foo/bar%20baz#qux%20quux'
      const urlParts = urlTools.toParts(rawUrl)
      expect(urlParts.pathname).to.equal('/foo/bar baz')
      expect(urlParts.search).to.equal(undefined)
      expect(urlParts.hash).to.equal('qux quux')
    })

    it('should support routes with query and hash', () => {
      const rawUrl = '/foo/bar?baz=qux#garply'
      const urlParts = urlTools.toParts(rawUrl)
      expect(urlParts.pathname).to.equal('/foo/bar')
      expect(urlParts.search).to.equal('baz=qux')
      expect(urlParts.hash).to.equal('garply')
    })

  })

  describe('.parseQuery(querystring)', () => {

    it('should return an object with keys and values', () => {
      const parsed = urlTools.parseQuery('foo=bar&baz=qux')
      expect(parsed).to.deep.equal({ foo: 'bar', baz: 'qux' })
    })

  })

  describe('.formatQuery(params)', () => {

    it('should return a querystring', () => {
      const formatted = urlTools.formatQuery({ foo: 'bar', baz: 'qux' })
      expect(formatted).to.equal('foo=bar&baz=qux')
    })

  })

  describe('.combine(pathname, search, fragment', () => {

    it('should not require search or fragment', () => {
      const combined = urlTools.combine('/foo bar/baz')
      expect(combined).to.equal('/foo bar/baz')
    })

    it('should accept an object for search', () => {
      const combined = urlTools.combine('/foo bar/baz', { grault: 'garply' })
      expect(combined).to.equal('/foo bar/baz?grault=garply')
    })

    it('should accept a hash fragment', () => {
      const combined = urlTools.combine('/foo bar/baz', null, 'qux')
      expect(combined).to.equal('/foo bar/baz#qux')
    })

  })

})
