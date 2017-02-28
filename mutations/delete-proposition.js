import Relay from 'react-relay';
import _ from 'lodash';

export default class UpdateProposition extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation { deleteProposition }`;
  }

  getVariables() {
    return _.pick(this.props, 'id');
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DeletePropositionPayload {
        id
        parent_proposition {
          children
        }
      }
    `
  }

  getConfigs() {
    return [{
      type: 'RANGE_DELETE',
      parentName: 'parent_proposition',
      parentID: this.props.parent_id,
      connectionName: 'children',
      deletedIDFieldName: 'id',
      pathToConnection: ['parent_proposition', 'children']
    }];
  }

}