import Relay from 'react-relay'
import _ from 'lodash'

export default class UpdateProposition extends Relay.Mutation {
  getMutation () {
    return Relay.QL`mutation { deleteProposition }`
  }

  getVariables () {
    return _.pick(this.props, 'id')
  }

  getFatQuery () {
    return Relay.QL`
      fragment on DeletePropositionPayload {
        id
        parent {
          propositions
          propositions_count
        }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'RANGE_DELETE',
      parentName: 'parent',
      parentID: this.props.parent_id || 'viewer',
      connectionName: 'propositions',
      deletedIDFieldName: 'id',
      pathToConnection: ['parent', 'propositions']
    }]
  }
}
