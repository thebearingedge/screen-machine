
import { expect } from '@thebearingedge/test-utils'
import Route from '../src/route'

describe('Route', () => {

  it('should have a specificity rating', () => {
    let route
    route = new Route('app', '/')
    expect(route.specificity).to.equal('1')
    route = new Route('app.login', 'login')
    expect(route.specificity).to.equal('4')
    route = new Route('app.pictures.picture', 'pictures/:pictureId')
    expect(route.specificity).to.equal('43')
  })

  describe('.addChild(route)', () => {

    it('should add a child route and set itself as parent', () => {
      const parent = new Route('app', '/')
      const child = new Route('app.login', '/login')
      parent.addChild(child)
      expect(parent.children[0]).to.equal(child)
      expect(child.parent).to.equal(parent)
    })

  })

  describe('.match(pathStrings)', () => {

    it('should extract match from pathStrings', () => {
      const strings = ['profile', 'foo']
      const route = new Route('app.login', 'profile/:username')
      const matched = route.match(strings)
      expect(matched).to.deep.equal([{}, { username: 'foo' }])
      expect(strings.length).to.equal(0)
    })

    it('should not extract a match if path is too short', () => {
      const strings = ['pictures', 'favorites']
      const route = new Route('app.login', 'pictures/favorites/:pictureId')
      const matched = route.match(strings)
      expect(matched).to.equal(null)
      expect(strings.length).to.equal(2)
    })

    it('should not extract a match if not all segments match', () => {
      const strings = ['pictures', '7', 'captions']
      const route = new Route('caption', 'pictures/:pictureId/tags')
      const matched = route.match(strings)
      expect(matched).to.equal(null)
      expect(strings.length).to.equal(3)
    })

    it('should extract partial matches', () => {
      const strings = ['pictures', '7', 'captions']
      const route = new Route('caption', 'pictures/:pictureId')
      const matched = route.match(strings)
      expect(matched).to.deep.equal([{}, { pictureId: '7' }])
      expect(strings.length).to.equal(1)
    })

    it('should match the remaining strings with a splat', () => {
      const strings = ['feed', 'stories', '42', 'comments', '70']
      const route = new Route('story', '*notFound')
      const matched = route.match(strings)
      expect(matched)
        .to.deep.equal([{ notFound: 'feed/stories/42/comments/70'}])
      expect(strings.length).to.equal(0)
    })

  })

  describe('.generate(params)', () => {

    it('should return a url path', () => {
      const path = new Route('root', '/').generate({})
      expect(path).to.equal('/')
    })

    it('should interpolate a url path', () => {
      const root = new Route('root', '/')
      const foo = new Route('foo', 'foo/:bar')
      const qux = new Route('qux', 'qux/:quux')
      root.addChild(foo)
      foo.addChild(qux)
      expect(foo.generate({ bar: 'baz' })).to.equal('/foo/baz')
      expect(qux.generate({ bar: 'baz', quux: 'grault' }))
        .to.equal('/foo/baz/qux/grault')
    })

  })

})
