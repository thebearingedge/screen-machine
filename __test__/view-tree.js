
import chai from 'chai'
import { spy } from 'sinon'
import sinonChai from 'sinon-chai'
import { jsdom } from 'jsdom'
import State from '../src/state'
import viewTree from '../src/view-tree'
import View from '../src/view'
import BaseComponent from '../src/base-component'

const document = jsdom()

chai.use(sinonChai)

const { expect } = chai

describe('viewTree', () => {

  describe('.processState(state)', () => {

    let tree, rootState

    beforeEach(() => {
      tree = viewTree(document, BaseComponent)
      rootState = new State({ name: '' })
      rootState.addView(tree.views['@'])
    })

    it('should have a root View', () => {
      expect(tree.views['@'] instanceof View).to.equal(true)
    })

    it('should do nothing if a state defines no components', () => {
      const empty = new State({ name: 'empty' })
      tree.processState(empty)
      expect(empty.$components).to.equal(null)
      expect(tree.views).to.deep.equal({
        '@': tree.views['@']
      })
    })

    it('should not create a view more than once', () => {
      spy(tree, 'createView')
      const rootView = tree.views['@']
      const user = new State({
        name: 'user',
        component: 'user-component'
      })
      user.inheritFrom(rootState)
      tree.processState(user)
      expect(user.$components[0].view).to.equal(rootView)
      expect(tree.createView.called).to.equal(false)
    })


    it('should create a component on the state', () => {
      const user = new State({
        name: 'user',
        component: 'user-component'
      })
      user.inheritFrom(rootState)
      tree.processState(user)
      const userComponent = user.$components[0]
      expect(userComponent instanceof BaseComponent).to.equal(true)
    })


    it('should create a new view on the target state', () => {
      spy(tree, 'createView')
      const user = new State({
        name: 'user',
        component: 'user-component'
      })
      const editUser = new State({
        name: 'user.editUser',
        component: 'edit-user-component'
      })
      user.inheritFrom(rootState)
      editUser.inheritFrom(user)
      tree.processState(user)
      tree.processState(editUser)
      const userView = tree.views['@user']
      expect(tree.createView.calledOnce).to.equal(true)
      expect(userView instanceof View).to.equal(true)
      expect(user.$views[0]).to.equal(userView)
    })


    it('should associate views and components', () => {
      const user = new State({
        name: 'user',
        component: 'user'
      })
      const editUser = new State({
        name: 'user.editUser',
        component: 'edit-user'
      })
      const userNotes = new State({
        name: 'user.editUser.userNotes',
        views: {
          'left': { component: 'user-notes-left' },
          'right': { component: 'user-notes-right' }
        }
      })
      const bonus = new State({
        name: 'user.editUser.userNotes.bonus',
        views: {
          'left@user.editUser': { component: 'bonus-component' }
        }
      })
      const userStatus = new State({
        name: 'userStatus',
        parent: 'user.editUser',
        component: 'user-status'
      })
      const userProfile = new State({
        name: 'userProfile',
        parent: 'user',
        views: {
          '': { component: 'user-profile' },
          '@userProfile': { component: 'user-photos' },
        }
      })
      const admin = new State({
        name: 'admin',
        views: {
          '': { component: 'admin' },
          '@admin': { component: 'admin-console' }
        }
      })

      user.inheritFrom(rootState)
      editUser.inheritFrom(user)
      userNotes.inheritFrom(editUser)
      bonus.inheritFrom(userNotes)
      userStatus.inheritFrom(editUser)
      userProfile.inheritFrom(user)
      admin.inheritFrom(rootState)

      tree.processState(user)
      tree.processState(editUser)
      tree.processState(userNotes)
      tree.processState(bonus)
      tree.processState(userStatus)
      tree.processState(userProfile)
      tree.processState(admin)

      const rootView = tree.views['@']
      const userView = tree.views['@user']
      const editUserView = tree.views['@user.editUser']
      const editUserLeftView = tree.views['left@user.editUser']
      const editUserRightView = tree.views['right@user.editUser']
      const userProfileView = tree.views['@userProfile']
      const adminView = tree.views['@admin']

      expect(tree.views).to.deep.equal({
        '@': rootView,
        '@user': userView,
        '@user.editUser': editUserView,
        'left@user.editUser': editUserLeftView,
        'right@user.editUser': editUserRightView,
        '@userProfile': userProfileView,
        '@admin': adminView
      })

      expect(rootState.$views.length).to.equal(1)
      expect(user.$views.length).to.equal(1)
      expect(editUser.$views.length).to.equal(3)
      expect(userNotes.$views).to.equal(null)
      expect(userProfile.$views.length).to.equal(1)
      expect(admin.$views.length).to.equal(1)

      expect(rootState.$components).to.equal(null)
      expect(user.$components.length).to.equal(1)
      expect(editUser.$components.length).to.equal(1)
      expect(userNotes.$components.length).to.equal(2)
      expect(userProfile.$components.length).to.equal(2)
      expect(admin.$components.length).to.equal(2)

      const userComponent = user.$components[0]
      const editUserComponent = editUser.$components[0]
      const userNotesComponentLeft = userNotes.$components[0]
      const userNotesComponentRight = userNotes.$components[1]
      const userProfileComponent = userProfile.$components[0]
      const userPhotosComponent = userProfile.$components[1]
      const adminComponent = admin.$components[0]
      const adminConsoleComponent = admin.$components[1]

      expect(rootView.container).to.equal(null)
      expect(userView.container).to.equal(userComponent)
      expect(editUserLeftView.container).to.equal(editUserComponent)
      expect(editUserRightView.container).to.equal(editUserComponent)
      expect(userProfileView.container).to.equal(userProfileComponent)
      expect(adminView.container).to.equal(adminComponent)

      expect(rootView.parent).to.equal(null)
      expect(userView.parent).to.equal(rootView)
      expect(editUserLeftView.parent).to.equal(userView)
      expect(editUserRightView.parent).to.equal(userView)
      expect(userProfileView.parent).to.equal(userView)
      expect(adminView.parent).to.equal(rootView)

      expect(userComponent.view).to.equal(rootView)
      expect(editUserComponent.view).to.equal(userView)
      expect(userNotesComponentLeft.view).to.equal(editUserLeftView)
      expect(userNotesComponentRight.view).to.equal(editUserRightView)
      expect(userProfileComponent.view).to.equal(userView)
      expect(userPhotosComponent.view).to.equal(userProfileView)
      expect(adminComponent.view).to.equal(rootView)
      expect(adminConsoleComponent.view).to.equal(adminView)
    })

  })

})
