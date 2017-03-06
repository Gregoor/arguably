import Relay from 'react-relay'

import LogoutMutation from './mutations/logout'
import store from './store'

module.exports = () => {
  store.dispatch({type: 'LOGOUT'})
  Relay.Store.commitUpdate(new LogoutMutation())
}
