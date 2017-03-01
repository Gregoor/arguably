import Relay from 'react-relay';
import _ from 'lodash';

export default class CreateProposition extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation { createProposition }`;
  }

  getVariables() {
    return {
      proposition: _.pick(this.props.proposition, 'name', 'text', 'parent_id', 'type', 'source_url')
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreatePropositionPayload {
        parent_proposition {
          children
        }
        proposition_edge
      }
    `
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'parent_proposition',
      parentID: this.props.proposition.parent_id,
      connectionName: 'children',
      edgeName: 'proposition_edge',
      rangeBehaviors: {
        '': 'prepend'
      }
    }];
  }

}