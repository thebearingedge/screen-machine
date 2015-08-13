
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var document = require('jsdom').jsdom();

chai.use(sinonChai);


var riot = require('riot');
var riotComponent = require('../riotComponent');
var viewTree = require('../modules/viewTree');
var stateRegistry = require('../modules/stateRegistry');
var resolveService = require('../modules/resolveService');
var routes = { add: function () {} };

require('./riot-tags/all');

describe('Riot Component Composition', function () {

  var views, RiotComponent, registry, resolves, appRoot, rootView;

  beforeEach(function () {

    document.body.innerHTML = '';
    global.document = document;
    appRoot = document.createElement('sm-view');
    document.body.appendChild(appRoot);
    RiotComponent = riotComponent(riot)(document);
    views = viewTree(document, RiotComponent);
    resolves = resolveService(Promise);
    registry = stateRegistry(views, resolves, routes);
    rootView = views.views['@'];

    views.mountRoot();

    registry
      .add('home', {
        component: 'home',
        resolve: {
          user: function () {}
        }
      })
      .add('home.messages', {
        component: 'messages',
        resolve: {
          messages: function () {}
        }
      })
      .add('home.albums', {
        component: 'albums',
        resolve: {
          albums: function () {}
        }
      })
      .add('profile', {
        component: 'profile'
      })
      .add('timeline', {
        views: {
          '@timeline': {
            component: 'share'
          },
          '': {
            component: 'timeline'
          }
        },
        resolve: {
          stories: function () {}
        }
      })
      .add('home.about', {
        views: {
          '': {
            component: 'about'
          },
          'modal@home': {
            component: 'modal'
          }
        }
      })
      .add('home.about.contact', {
        views: {
          '@': {
            component: 'contact'
          }
        }
      });
  });


  afterEach(function () {

    global.document = undefined;
  });


  it('should render a component into the app root', function () {

    var components = registry.states.home.getAllComponents();
    var resolved = { 'user@home': { name: 'John Doe' } };
    var params = { userId: 42 };

    views.compose(components, resolved, params);

    expect(appRoot.innerHTML)
      .to.equal(
        '<home riot-tag="home">' +
          '<h1>Welcome, John Doe!</h1> ' +
          '<p>Your are user #42</p> '+
          '<sm-view></sm-view> ' +
          '<sm-view name="modal"></sm-view>' +
        '</home>'
      );
  });


  it('should update the rendered view tree', function () {

    var components = registry.states.home.getAllComponents();
    var resolved = { 'user@home': { name: 'John Doe' } };
    var params = { userId: 42 };

    views.compose(components, resolved, params);

    resolved = { 'user@home': { name: 'Jane Doe' } };
    params = { userId: 7 };

    views.compose(components, resolved, params);

    expect(appRoot.innerHTML)
      .to.equal(
        '<home riot-tag="home">' +
          '<h1>Welcome, Jane Doe!</h1> ' +
          '<p>Your are user #7</p> '+
          '<sm-view></sm-view> ' +
          '<sm-view name="modal"></sm-view>' +
        '</home>'
      );
  });


  it('should rerender the view tree', function () {

    var components = registry.states.home.getAllComponents();
    var resolved = { 'user@home': { name: 'John Doe' } };
    var params = { userId: 42 };

    views.compose(components, resolved, params);

    components = registry.states.profile.getAllComponents();

    views.compose(components);

    expect(appRoot.innerHTML)
      .to.equal(
        '<profile riot-tag="profile">' +
          '<span>Welcome to your profile.</span>' +
        '</profile>'
      );
  });


  it('should nest views', function () {

    var components = registry.states['home.messages'].getAllComponents();
    var resolved = {
      'user@home': { name: 'John Doe' },
      'messages@home.messages': [
        { title: 'Message 1' },
        { title: 'Message 2' }
      ]
    };
    var params = { userId: 42 };

    views.compose(components, resolved, params);

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
                '<!--riot placeholder-->' +
              '</ul>' +
            '</messages>' +
          '</sm-view> ' +
          '<sm-view name="modal"></sm-view>' +
        '</home>'
      );
  });


  it('should close nested views', function () {

    var components = registry.states['home.messages'].getAllComponents();
    var resolved = {
      'user@home': { name: 'John Doe' },
      'messages@home.messages': [
        { title: 'Message 1' },
        { title: 'Message 2' }
      ]
    };
    var params = { userId: 42 };

    views.compose(components, resolved, params);

    components = registry.states.home.getAllComponents();
    resolved = { 'user@home': { name: 'John Doe' } };
    params = { userId: 42 };

    views.compose(components, resolved, params);

    expect(appRoot.innerHTML)
      .to.equal(
        '<home riot-tag="home">' +
          '<h1>Welcome, John Doe!</h1> ' +
          '<p>Your are user #42</p> '+
          '<sm-view></sm-view> ' +
          '<sm-view name="modal"></sm-view>' +
        '</home>'
      );
  });


  it('should replace nested views', function () {

    var components = registry.states['home.messages'].getAllComponents();
    var resolved = {
      'user@home': { name: 'John Doe' },
      'messages@home.messages': [
        { title: 'Message 1' },
        { title: 'Message 2' }
      ]
    };
    var params = { userId: 42 };

    views.compose(components, resolved, params);

    components = registry.states['home.albums'].getAllComponents();
    resolved = {
      'user@home': { name: 'Jane Doe' },
      'albums@home.albums': [
        { title: 'Album 1' },
        { title: 'Album 2' },
        { title: 'Album 3' }
      ]
    };
    params = { userId: 7 };

    views.compose(components, resolved, params);

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
                '<!--riot placeholder-->' +
              '</ul>' +
            '</albums>' +
          '</sm-view> ' +
          '<sm-view name="modal"></sm-view>' +
        '</home>'
      );
  });


  it('should render states that define their own child view', function () {

    var components = registry.states.timeline.getAllComponents();
    var resolved = {
      'stories@timeline': [
        { content: 'Event 1' },
        { content: 'Event 2' }
      ]
    };
    var params = {};

    views.compose(components, resolved, params);

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
            '<li>Event 2</li>' +
            '<!--riot placeholder--> ' +
          '</ul>' +
        '</timeline>'
      );
  });


  it('should render into named views', function () {

    var components = registry.states['home.about'].getAllComponents();
    var resolved = {
      'user@home': {
        name: 'Spongebob'
      }
    };
    var params = { userId: 1 };

    views.compose(components, resolved, params);

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
      );
  });


  it('should not render into shadowed views', function () {

    var components = registry.states['home.about'].getAllComponents();
    var resolved = {
      'user@home': {
        name: 'Spongebob'
      }
    };
    var params = { userId: 1 };

    views.compose(components, resolved, params);

    components = registry.states['home.about.contact'].getAllComponents();
    resolved = {
      'user@home': {
        name: 'Squidward'
      }
    };
    params = { userId: 2 };

    views.compose(components, resolved, params);

    expect(appRoot.innerHTML)
      .to.equal(
        '<contact riot-tag="contact">' +
          '<form> ' +
            '<label for="contactEmail">Enter your email</label> ' +
            '<input id="contactEmail" type="email"> ' +
          '</form>' +
        '</contact>'
      );
  });

});