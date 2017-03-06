import Relay from 'react-relay'

export default class SaveProposition extends Relay.Mutation {
  getMutation () {
    return this.props.id
      ? Relay.QL`mutation { updateProposition }`
      : Relay.QL`mutation { createProposition }`
  }

  getVariables () {
    return {proposition: this.props}
  }

  getFatQuery () {
    return this.props.id
        ? Relay.QL`
          fragment on UpdatePropositionPayload {
            proposition {
              name
              published
              text
              type
              source_url
            }
          }
        `
      : Relay.QL`
        fragment on CreatePropositionPayload {
          parent {
            propositions
            propositions_count
          }
          proposition_edge
        }
      `
  }

  getConfigs () {
    const {id, parent_id: parentID} = this.props
    return [id
      ? {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          proposition: id
        }
      }
      : {
        type: 'RANGE_ADD',
        parentName: 'parent',
        parentID: parentID || 'viewer',
        connectionName: 'propositions',
        edgeName: 'proposition_edge',
        rangeBehaviors: () => 'prepend'
      }
    ]
  }
}
