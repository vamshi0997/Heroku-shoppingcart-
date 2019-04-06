/* global describe beforeEach afterEach it */

import { expect } from 'chai'
import { me, logout } from './user'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import configureMockStore from 'redux-mock-store'
import thunkMiddleware from 'redux-thunk'
import history from '../history'

const middlewares = [thunkMiddleware]
const mockStore = configureMockStore(middlewares)

describe('thunk creators', () => {
  let store
  let mockAxios

  const initialState = { user: {} }

  beforeEach(() => {
    mockAxios = new MockAdapter(axios)
    store = mockStore(initialState)
  })

  afterEach(() => {
    mockAxios.restore()
    store.clearActions()
  })

  describe('me', () => {
    it('eventually dispatches the RECEIVE_ME action', async () => {
      const fakeUser = { email: 'user@test.com' }
      mockAxios.onGet('/auth/me').replyOnce(200, fakeUser)
      await store.dispatch(me())
      const actions = store.getActions()
      // `actions` has two indices because the thunk
      // dispatches two actions: Request and Receive
      expect(actions[0].type).to.be.equal('REQUEST_ME')
      expect(actions[1].type).to.be.equal('RECEIVE_ME')
      expect(actions[1].me).to.be.deep.equal(fakeUser)
    })
  })

  describe('logout', () => {
    it('logout: eventually dispatches the REMOVE_ME action', async () => {
      mockAxios.onPost('/auth/logout').replyOnce(204)
      await store.dispatch(logout())
      const actions = store.getActions()
      expect(actions[0].type).to.be.equal('REMOVE_ME')
      expect(history.location.pathname).to.be.equal('/')
    })
  })
})
