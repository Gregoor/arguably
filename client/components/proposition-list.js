import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Relay from 'react-relay';

import PropositionCard from '../components/proposition-card';


export default Relay.createContainer(
  ({parent: {id, propositions: {pageInfo, edges}}, viewer, relay}) => (
    <InfiniteScroll
      hasMore={pageInfo.hasNextPage}
      loadMore={() => {
        !relay.pendingVariables && relay.setVariables({first: relay.variables.first + 10})
      }}
      loader={<div style={{clear: 'both'}}>Loading ...</div>}>
      {edges.map(({node}) => (
        <PropositionCard key={node.id} proposition={node} viewer={viewer} parentID={id}/>
      ))}
    </InfiniteScroll>
  ),
  {

    initialVariables: {first: 20},

    fragments: {

      parent: () => Relay.QL`
        fragment on PropositionsParent {
          id
          propositions(first: $first) {
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
          ${PropositionCard.getFragment('viewer')}
        }
      `

    }

  }
);