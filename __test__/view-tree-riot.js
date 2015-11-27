
import { expect } from '@thebearingedge/test-utils'
import { jsdom } from 'jsdom'
import riot from 'riot'
import riotComponent from '../src/riot-component'
import viewTree from '../src/view-tree'
import stateRegistry from '../src/state-registry'
import resolveFactory from '../src/resolve-factory'

require('./riot-tags')

const document = jsdom()

describe('Riot Component Composition', () => {

  let views, RiotComponent, registry, resolves, appRoot

  beforeEach(() => {

    document.body.innerHTML = ''
    global.document = document
    appRoot = document.createElement('sm-view')
    document.body.appendChild(appRoot)
    RiotComponent = riotComponent(riot)(document)
    views = viewTree(document, RiotComponent)
    resolves = resolveFactory(Promise)
    registry = stateRegistry()
    views.mountRoot()
    const states = [
      registry.add('home', {
        component: 'home',
        resolve: {
          user: () => {}
        }
      }),
      registry.add('home.messages', {
        component: 'messages',
        resolve: {
          messages: () => {}
        }
      }),
      registry.add('home.albums', {
        component: 'albums',
        resolve: {
          albums: () => {}
        }
      }),
      registry.add('profile', {
        component: 'profile'
      }),
      registry.add('timeline', {
        views: {
          '@timeline': {
            component: 'share'
          },
          '': {
            component: 'timeline'
          }
        },
        resolve: {
          stories: () => {}
        }
      }),
      registry.add('home.about', {
        views: {
          '': {
            component: 'about'
          },
          'modal': {
            component: 'modal'
          }
        }
      }),
      registry.add('home.about.contact', {
        views: {
          '@': {
            component: 'contact'
          }
        }
      })
    ]
    states.forEach(state => {
      views.processState(state)
      resolves.addTo(state)
    })
  })

  afterEach(() => global.document = undefined)

  it('should render a component into the app root', () => {
    const components = registry.states.home.getAllComponents()
    const resolved = { 'user@home': { name: 'John Doe' } }
    const params = { userId: 42 }
    views.compose(components, resolved, params)
    expect(appRoot.innerHTML)
      .to.equal(
        '<home riot-tag="home">' +
          '<h1>Welcome, John Doe!</h1> ' +
          '<p>Your are user #42</p> '+
          '<sm-view></sm-view> ' +
          '<sm-view name="modal"></sm-view>' +
        '</home>'
      )
  })


  it('should update the rendered view tree', () => {
    let components = registry.states.home.getAllComponents()
    let resolved = { 'user@home': { name: 'John Doe' } }
    let params = { userId: 42 }
    views.compose(components, resolved, params)
    resolved = { 'user@home': { name: 'Jane Doe' } }
    params = { userId: 7 }
    views.compose(components, resolved, params)
    expect(appRoot.innerHTML)
      .to.equal(
        '<home riot-tag="home">' +
          '<h1>Welcome, Jane Doe!</h1> ' +
          '<p>Your are user #7</p> '+
          '<sm-view></sm-view> ' +
          '<sm-view name="modal"></sm-view>' +
        '</home>'
      )
  })

  it('should rerender the view tree', () => {
    let components = registry.states.home.getAllComponents()
    let resolved = { 'user@home': { name: 'John Doe' } }
    let params = { userId: 42 }
    views.compose(components, resolved, params)
    components = registry.states.profile.getAllComponents()
    views.compose(components)
    expect(appRoot.innerHTML)
      .to.equal(
        '<profile riot-tag="profile">' +
          '<span>Welcome to your profile.</span>' +
        '</profile>'
      )
  })

  it('should nest views', () => {
    const components = registry.states['home.messages'].getAllComponents()
    const resolved = {
      'user@home': { name: 'John Doe' },
      'messages@home.messages': [
        { title: 'Message 1' },
        { title: 'Message 2' }
      ]
    }
    const params = { userId: 42 }
    views.compose(components, resolved, params)
    expect(appRoot.innerHTML)
      .to.equal(
        '<home riot-tag="home">' +
          '<h1>Welcome, John Doe!</h1> ' +
          '<p>Your are user #42</p> ' +
          '<sm-view>' +
            '<messages riot-tag="messages">' +
              '<h5>You have 2 messages.</h5> ' +
              '<ul> ' +
                '<li> <span>Message 1</span> </li>' +
                '<li> <span>Message 2</span> </li>' +
              '</ul>' +
            '</messages>' +
          '</sm-view> ' +
          '<sm-view name="modal"></sm-view>' +
        '</home>'
      )
  })

  it('should close nested views', () => {
    let components = registry.states['home.messages'].getAllComponents()
    let resolved = {
      'user@home': { name: 'John Doe' },
      'messages@home.messages': [
        { title: 'Message 1' },
        { title: 'Message 2' }
      ]
    }
    let params = { userId: 42 }
    views.compose(components, resolved, params)
    components = registry.states.home.getAllComponents()
    resolved = { 'user@home': { name: 'John Doe' } }
    params = { userId: 42 }
    views.compose(components, resolved, params)
    expect(appRoot.innerHTML)
      .to.equal(
        '<home riot-tag="home">' +
          '<h1>Welcome, John Doe!</h1> ' +
          '<p>Your are user #42</p> '+
          '<sm-view></sm-view> ' +
          '<sm-view name="modal"></sm-view>' +
        '</home>'
      )
  })

  it('should replace nested views', () => {
    let components = registry.states['home.messages'].getAllComponents()
    let resolved = {
      'user@home': { name: 'John Doe' },
      'messages@home.messages': [
        { title: 'Message 1' },
        { title: 'Message 2' }
      ]
    }
    let params = { userId: 42 }
    views.compose(components, resolved, params)
    components = registry.states['home.albums'].getAllComponents()
    resolved = {
      'user@home': { name: 'Jane Doe' },
      'albums@home.albums': [
        { title: 'Album 1' },
        { title: 'Album 2' },
        { title: 'Album 3' }
      ]
    }
    params = { userId: 7 }
    views.compose(components, resolved, params)
    expect(appRoot.innerHTML)
      .to.equal(
        '<home riot-tag="home">' +
          '<h1>Welcome, Jane Doe!</h1> ' +
          '<p>Your are user #7</p> ' +
          '<sm-view>' +
            '<albums riot-tag="albums">' +
              '<h5>You have 3 albums.</h5> ' +
              '<ul> ' +
                '<li> <span>Album 1</span> </li>' +
                '<li> <span>Album 2</span> </li>' +
                '<li> <span>Album 3</span> </li>' +
              '</ul>' +
            '</albums>' +
          '</sm-view> ' +
          '<sm-view name="modal"></sm-view>' +
        '</home>'
      )
  })

  it('should render states that define their own child view', () => {
    const components = registry.states.timeline.getAllComponents()
    const resolved = {
      'stories@timeline': [
        { content: 'Event 1' },
        { content: 'Event 2' }
      ]
    }
    const params = {}
    views.compose(components, resolved, params)
    expect(appRoot.innerHTML)
      .to.equal(
        '<timeline riot-tag="timeline">' +
          '<sm-view>' +
            '<share riot-tag="share">' +
              '<textarea></textarea>' +
            '</share>' +
          '</sm-view> ' +
          '<ul> ' +
            '<li>Event 1</li>' +
            '<li>Event 2</li> ' +
          '</ul>' +
        '</timeline>'
      )
  })

  it('should render into named views', () => {
    let components = registry.states['home.about'].getAllComponents()
    let resolved = { 'user@home': { name: 'Spongebob' } }
    let params = { userId: 1 }
    views.compose(components, resolved, params)
    expect(appRoot.innerHTML)
      .to.equal(
        '<home riot-tag="home">' +
          '<h1>Welcome, Spongebob!</h1> ' +
          '<p>Your are user #1</p> '+
          '<sm-view>' +
            '<about riot-tag="about">' +
              '<p>Good info about our site!</p>' +
            '</about>' +
          '</sm-view> ' +
          '<sm-view name="modal">' +
            '<modal riot-tag="modal">' +
              '<span>This is a modal.</span>' +
            '</modal>' +
          '</sm-view>' +
        '</home>'
      )
  })

  it('should not render into shadowed views', () => {
    let components = registry.states['home.about'].getAllComponents()
    let resolved = { 'user@home': { name: 'Spongebob' } }
    let params = { userId: 1 }
    views.compose(components, resolved, params)
    components = registry.states['home.about.contact'].getAllComponents()
    resolved = { 'user@home': { name: 'Squidward' } }
    params = { userId: 2 }
    views.compose(components, resolved, params)
    expect(appRoot.innerHTML)
      .to.equal(
        '<contact riot-tag="contact">' +
          '<form> ' +
            '<label for="contactEmail">Enter your email</label> ' +
            '<input id="contactEmail" type="email"> ' +
          '</form>' +
        '</contact>'
      )
  })

})
