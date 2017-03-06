import {createStore, combineReducers} from 'redux'
import {reducer as formReducer} from 'redux-form'
import store from 'store'

const initialState = {
  jwt: store.get('jwt')
}

export default createStore(combineReducers({
  state (state = initialState, action) {
    switch (action.type) {
      case 'LOGIN':
        store.set('jwt', action.jwt)
        return {...state, jwt: action.jwt}

      case 'LOGOUT':
        store.clearAll()
        return {...state, jwt: null}

      default:
        return state
    }
  },
  form: formReducer
}))
