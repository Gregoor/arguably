import Relay from 'react-relay';

export default class Vote extends Relay.Mutation {

  static fragments = {
    proposition: () => Relay.QL`
      fragment on Proposition {
        id
        voted_by_user
        votes_count
      }
    `
  };

  getIsVoted = () => this.props.proposition.voted_by_user;

  getMutation() {
    return this.getIsVoted() ? Relay.QL`mutation { unvote }` : Relay.QL`mutation { vote }`;
  }

  getVariables() {
    return {proposition_id: this.props.proposition.id};
  }

  getFatQuery() {
    return this.getIsVoted()
        ? Relay.QL`
          fragment on UnvotePayload {
            proposition {
              voted_by_user
              votes_count
            }
          }
        `
      : Relay.QL`
        fragment on VotePayload {
          proposition {
            voted_by_user
            votes_count
          }
        }
      `;
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
    const {voted_by_user, votes_count} = this.props.proposition;
    return {
      proposition: {
        voted_by_user: !voted_by_user,
        votes_count: votes_count + (voted_by_user ? -1 : 1)
      }
    };
  }

}