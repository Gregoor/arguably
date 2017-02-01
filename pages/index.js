import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Relay from 'react-relay';

import PropositionCard from '../components/proposition-card';
import RelayPage from '../components/relay-page';


export default () => RelayPage(Relay.createContainer(
  ({viewer: {root_propositions: {pageInfo, edges}, ...viewer}, relay}) => (
    <InfiniteScroll
      hasMore={pageInfo.hasNextPage}
      loadMore={() => relay.setVariables({first: relay.variables.first + 10})}
      loader={<div>Loading ...</div>}>
      {edges.map(({node}) => (
        <PropositionCard key={node.id} proposition={node} viewer={viewer} withStats/>
      ))}
    </InfiniteScroll>
  ),
  {

    initialVariables: {first: 20},

    fragments: {viewer: () => Relay.QL`    
      fragment on Viewer {
        root_propositions(first: $first) {
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              id
              ${PropositionCard.getFragment('proposition', {withStats: true})}
            }
          }
        }
        ${PropositionCard.getFragment('viewer', {withStats: true})}
      }
    `}

  }
));