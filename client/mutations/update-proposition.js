import Relay from 'react-relay';
import _ from 'lodash';

export default class UpdateProposition extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation { updateProposition }`;
  }

  getVariables() {
    return {
      proposition: _.pick(this.props.proposition,
        'id', 'name', 'text', 'parent_id', 'type', 'source_url'
      )
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdatePropositionPayload {
        proposition {
          name
          text
          type
          source_url
        }
      }
    `
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        proposition: this.props.proposition.id,
      },
    }];
  }

  getOptimisticResponse() {
    return this.getVariables();
  }

}