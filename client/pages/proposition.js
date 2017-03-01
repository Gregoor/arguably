import React, {Component} from 'react';
import DocumentTitle from 'react-document-title';
import Relay from 'react-relay';
import InfiniteScroll from 'react-infinite-scroller';

import PropositionCard from '../components/proposition-card';


class PropositionPage extends Component {

  loadMore = () => {
    const {relay} = this.props;
    relay.setVariables({first: relay.variables.first + 10})
  };

  render() {
    const {proposition: {id, name, children, ...proposition}, viewer} = this.props;
    return (
      <DocumentTitle title={name + ' - Arguably'}><div>

        <PropositionCard {...{proposition, viewer}} withParent/>

        {viewer.user && viewer.user.can_publish && (
          <PropositionCard proposition={null} parentID={id} viewer={viewer}/>
        )}

        <InfiniteScroll
          hasMore={children.pageInfo.hasNextPage}
          loadMore={this.loadMore}
          loader={<div>Loading ...</div>}>
          {children.edges.map(({node}) => (
            <PropositionCard key={node.id} proposition={node} viewer={viewer} withStats/>
          ))}
        </InfiniteScroll>

      </div></DocumentTitle>
    );
  }

}

PropositionPage = Relay.createContainer(PropositionPage, {

  initialVariables: {first: 20},

  fragments: {

    proposition: () => Relay.QL`
      fragment on Proposition {
        id
        name
        ${PropositionCard.getFragment('proposition')}
        children(first: $first) {
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              id
              ${PropositionCard.getFragment('proposition')}
            }
          }
        }
      }
    `,

    viewer: () => Relay.QL`
      fragment on Viewer {
        user {
          can_publish
        }
        ${PropositionCard.getFragment('viewer')}
      }
    `

  }

});

export default Relay.createContainer(
  ({node, viewer}) => <PropositionPage proposition={node} viewer={viewer}/>,
  {
    fragments: {

      node: () => Relay.QL`
        fragment on Node {
          ${PropositionPage.getFragment('proposition')}
        }
      `,

      viewer: () => Relay.QL`
        fragment on Viewer {
          ${PropositionPage.getFragment('viewer')}
        }
      `

    }
  }
);



