
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

var State = require('../modules/State');
var viewTree = require('../modules/viewTree');
var View = require('../modules/View');
var Component = require('../modules/Component');


describe('viewTree', function () {

  var tree, rootState;

  beforeEach(function () {

    tree = viewTree(View, Component);
    rootState = new State({ name: '' });
    rootState.addView(tree.views['@']);
  });


  it('should have a root View', function () {

    expect(tree.views['@'] instanceof View).to.equal(true);
  });


  it('should do nothing if a state defines no components', function () {

    var empty = new State({
      name: 'empty'
    });

    tree.processState(empty);

    expect(empty.$components).to.equal(null);
    expect(tree.views).to.deep.equal({
      '@': tree.views['@']
    });
  });


  it('should not create a view more than once', function () {

    sinon.spy(tree, 'createView');
    var rootView = tree.views['@'];

    var user = new State({
      name: 'user',
      component: 'user-component'
    });

    user.inheritFrom(rootState);

    tree.processState(user);


    expect(user.$components[0].view).to.equal(rootView);
    expect(tree.createView.called).to.equal(false);
  });


  it('should create a component on the state', function () {

    var user = new State({
      name: 'user',
      component: 'user-component'
    });

    user.inheritFrom(rootState);

    tree.processState(user);

    var userComponent = user.$components[0];
    expect(userComponent instanceof Component).to.equal(true);
  });


  it('should create a new view on the target state', function () {

    sinon.spy(tree, 'createView');

    var user = new State({
      name: 'user',
      component: 'user-component'
    });

    var editUser = new State({
      name: 'user.editUser',
      component: 'edit-user-component'
    });

    user.inheritFrom(rootState);
    editUser.inheritFrom(user);

    tree.processState(user);
    tree.processState(editUser);

    var userView = tree.views['@user'];

    expect(tree.createView.calledOnce).to.equal(true);
    expect(userView instanceof View).to.equal(true);
    expect(user.$views[0]).to.equal(userView);
  });


  it('should associate views and components', function () {

    var user = new State({
      name: 'user',
      component: 'user'
    });

    var editUser = new State({
      name: 'user.editUser',
      component: 'edit-user'
    });

    var userNotes = new State({
      name: 'user.editUser.userNotes',
      views: {
        'left': {
          component: 'user-notes-left'
        },
        'right': {
          component: 'user-notes-right'
        }
      }
    });

    var userLog = new State({
      name: 'user.editUser.userNotes.userLog',
      views: {
        'left@user.editUser': {
          component: 'user-log'
        }
      }
    });

    var userStatus = new State({
      name: 'userStatus',
      parent: 'user.editUser.userNotes.userLog',
      component: 'user-status'
    });

    var userProfile = new State({
      name: 'userProfile',
      parent: 'user',
      views: {
        '': {
          component: 'user-profile'
        },
        '@userProfile': {
          component: 'user-photos'
        }
      }
    });

    var admin = new State({
      name: 'admin',
      views: {
        '': {
          component: 'admin'
        },
        '@admin': {
          component: 'admin-console'
        }
      }
    });

    user.inheritFrom(rootState);
    editUser.inheritFrom(user);
    userNotes.inheritFrom(editUser);
    userLog.inheritFrom(userNotes);
    userStatus.inheritFrom(userLog);
    userProfile.inheritFrom(user);
    admin.inheritFrom(rootState);

    tree.processState(user);
    tree.processState(editUser);
    tree.processState(userNotes);
    tree.processState(userLog);
    tree.processState(userStatus);
    tree.processState(userProfile);
    tree.processState(admin);

    var rootView = tree.views['@'];
    var userView = tree.views['@user'];
    var editUserLeftView = tree.views['left@user.editUser'];
    var editUserRightView = tree.views['right@user.editUser'];
    var userProfileView = tree.views['@userProfile'];
    var adminView = tree.views['@admin'];

    expect(tree.views).to.deep.equal({
      '@': rootView,
      '@user': userView,
      'left@user.editUser': editUserLeftView,
      'right@user.editUser': editUserRightView,
      '@userProfile': userProfileView,
      '@admin': adminView
    });


    expect(rootState.$views.length).to.equal(1);
    expect(user.$views.length).to.equal(1);
    expect(editUser.$views.length).to.equal(2);
    expect(userNotes.$views).to.equal(null);
    expect(userLog.$views).to.equal(null);
    expect(userProfile.$views.length).to.equal(1);
    expect(admin.$views.length).to.equal(1);


    expect(rootState.$components).to.equal(null);
    expect(user.$components.length).to.equal(1);
    expect(editUser.$components.length).to.equal(1);
    expect(userNotes.$components.length).to.equal(2);
    expect(userLog.$components.length).to.equal(1);
    expect(userProfile.$components.length).to.equal(2);
    expect(admin.$components.length).to.equal(2);


    var userComponent = user.$components[0];
    var editUserComponent = editUser.$components[0];
    var userNotesComponentLeft = userNotes.$components[0];
    var userNotesComponentRight = userNotes.$components[1];
    var userLogComponent = userLog.$components[0];
    expect(userLogComponent.name).to.equal('left');
    var userProfileComponent = userProfile.$components[0];
    var userPhotosComponent = userProfile.$components[1];
    var adminComponent = admin.$components[0];
    var adminConsoleComponent = admin.$components[1];


    expect(rootView.container).to.equal(null);
    expect(userView.container).to.equal(userComponent);
    expect(editUserLeftView.container).to.equal(editUserComponent);
    expect(editUserRightView.container).to.equal(editUserComponent);
    expect(userProfileView.container).to.equal(userProfileComponent);
    expect(adminView.container).to.equal(adminComponent);


    expect(rootView.parent).to.equal(null);
    expect(userView.parent).to.equal(rootView);
    expect(editUserLeftView.parent).to.equal(userView);
    expect(editUserRightView.parent).to.equal(userView);
    expect(userProfileView.parent).to.equal(userView);
    expect(adminView.parent).to.equal(rootView);


    expect(userComponent.view).to.equal(rootView);
    expect(editUserComponent.view).to.equal(userView);
    expect(userNotesComponentLeft.view).to.equal(editUserLeftView);
    expect(userNotesComponentRight.view).to.equal(editUserRightView);
    expect(userLogComponent.view).to.equal(editUserLeftView);
    expect(userProfileComponent.view).to.equal(userView);
    expect(userPhotosComponent.view).to.equal(userProfileView);
    expect(adminComponent.view).to.equal(rootView);
    expect(adminConsoleComponent.view).to.equal(adminView);
  });

});