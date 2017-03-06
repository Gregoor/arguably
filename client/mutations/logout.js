import Relay from 'react-relay'

export default class Logout extends Relay.Mutation {
  getMutation () {
    return Relay.QL`mutation { logout }`
  }

  getVariables () {
    return {}
  }

  getFatQuery () {
    return Relay.QL`
      fragment on LogoutPayload {
        viewer {
          propositions
          user
        }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: 'viewer'
      }
    }]
  }
}
