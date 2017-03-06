import Relay from 'react-relay'
import _ from 'lodash'

export default class Authorize extends Relay.Mutation {
  getMutation () {
    return this.props.isNew
      ? Relay.QL`mutation { register }`
      : Relay.QL`mutation { login }`
  }

  getVariables () {
    return _.pick(this.props, 'name', 'password')
  }

  getFatQuery () {
    return this.props.isNew
      ? Relay.QL`
        fragment on RegisterPayload {
          viewer {
            propositions
            user
          }
        }
      `
      : Relay.QL`
        fragment on LoginPayload {
          viewer {
            propositions
            user
          }
        }
      `
  }

  getConfigs () {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          viewer: 'viewer'
        }
      },
      {
        type: 'REQUIRED_CHILDREN',
        children: [
          this.props.isNew
            ? Relay.QL`
              fragment on RegisterPayload {
                jwt
              }
            `
            : Relay.QL`
              fragment on LoginPayload {
                jwt
              }
          `
        ]
      }
    ]
  }
}
