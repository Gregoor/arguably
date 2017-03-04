import Relay from 'react-relay';
import _ from 'lodash';

export default class SaveProposition extends Relay.Mutation {

  getMutation() {
    return this.props.id
      ? Relay.QL`mutation { updateProposition }`
      : Relay.QL`mutation { createProposition }`;
  }

  getVariables() {
    return {
      proposition: _.pick(this.props,
        'id', 'name', 'text', 'published', 'parent_id', 'type', 'source_url'
      )
    };
  }

  getFatQuery() {
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
      `;
  }

  getConfigs() {
    const {id, parent_id} = this.props;
    return [id
      ? {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          proposition: id,
        },
      }
      : {
        type: 'RANGE_ADD',
        parentName: 'parent',
        parentID: parent_id || 'viewer',
        connectionName: 'propositions',
        edgeName: 'proposition_edge',
        rangeBehaviors: () => 'prepend'
      }
    ];
  }

}