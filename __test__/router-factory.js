
import { expect } from '@thebearingedge/test-utils'
import routerFactory from '../src/router-factory'

describe('routerFactory', () => {

  describe('.add(name, path)', () => {

    let router

    beforeEach(() => router = routerFactory())

    it('should register routes', () => {

      const appRoute = router
        .add('app', '/')
        .routes.app

      expect(appRoute).to.equal(router.root)

      const photosRoute = router
        .add('app.photos', 'photos')
        .routes['app.photos']

      expect(photosRoute.parent).to.equal(appRoute)
      expect(appRoute.children[0]).to.equal(photosRoute)

      const loginRoute = router
        .add('app.login', 'login')
        .routes['app.login']

      expect(loginRoute.parent).to.equal(appRoute)
      expect(appRoute.children[1]).to.equal(loginRoute)

      const landingRoute = router
        .add('landing', 'landing')
        .routes.landing

      expect(landingRoute.parent).to.equal(appRoute)
      expect(appRoute.children[2]).to.equal(landingRoute)
    })

  })


  describe('.href(name, params, query, fragment)', () => {

    let router

    beforeEach(() => {
      router = routerFactory()
        .add('app', '/')
        .add('app.users', 'users')
        .add('app.users.profile', ':userId')
        .add('landing', '/landing')
        .add('landing.about', '/about')
    })

    it('should compile absolute routes', () => {
      expect(router.href('landing')).to.equal('/landing')
    })

    it('should compile reset absolute routes', () => {
      expect(router.href('landing.about')).to.equal('/about')
    })

    it('should compile routes with params', () => {
      const href = router.href('app.users.profile', { userId: '7' })
      expect(href).to.equal('/users/7')
    })

    it('should compile routes with queries', () => {
      const href = router.href('app', {}, { foo: 'bar' })
      expect(href).to.equal('/?foo=bar')
    })

    it('should compile routes with fragments', () => {
      const href = router.href('app.users', {}, {}, 'howdy')
      expect(href).to.equal('/users#howdy')
    })

    it('should compile complex routes', () => {
      const href = router
        .href('app.users.profile', { userId: '7' }, { foo: 'bar' }, 'howdy')
      expect(href).to.equal('/users/7?foo=bar#howdy')
    })

  })

  describe('.find(path)', () => {

    let router

    beforeEach(() => {
      router = routerFactory()
        .add('app.users', 'users')
        .add('landing', '/landing')
        .add('app.login', 'login')
        .add('app', '/')
        .add('app.users.profile', ':userId')
        .add('app.users.profile.notFound', '*notFound')
        .add('app.users.search', 'search')
        .add('app.users.profile.friends', 'friends')
        .add('landing.about', '/about')
    })

    it('should find a route', () => {
      expect(router.routes['landing.about']).to.exist
      expect(router.find('/?foo=bar'))
        .to.deep.equal(['app', {}, { foo: 'bar' }])
      expect(router.find('/login')).to.deep.equal(['app.login', {}, {}])
      expect(router.find('/users')).to.deep.equal(['app.users', {}, {}])
      expect(router.find('/landing')).to.deep.equal(['landing', {}, {}])
      expect(router.find('/about'))
        .to.deep.equal(['landing.about', {}, {}])
    })

    it('should find a static route first', () => {
      expect(router.find('/users/search'))
        .to.deep.equal(['app.users.search', {}, {}])
    })

    it('should find a dynamic route second', () => {
      expect(router.find('/users/7'))
        .to.deep.equal(['app.users.profile', { userId: '7' }, {}])
    })

    it('should find a splat route', () => {
      expect(router.find('/users/7/so/cool'))
        .to.deep.equal([
          'app.users.profile.notFound',
          { userId: '7', notFound: 'so/cool' },
          {}
        ])
    })

    it('should find a static nested route before a splat route', () => {
      expect(router.find('/users/7/friends'))
        .to.deep.equal(['app.users.profile.friends', { userId: '7' }, {}])
    })

    it('should not find a route that doesn\'t exist', () => {
      expect(router.find('/some/crazy/garbage')).to.equal(null)
    })

    it('should find a sole index route', () => {
      const index = routerFactory().add('index', '/').find('/')
      expect(index).to.deep.equal(['index', {}, {}])
    })

  })

})
