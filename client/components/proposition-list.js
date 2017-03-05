import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Relay from 'react-relay';

import PropositionCard from '../components/proposition-card';

const BATCH_SIZE = 3;

export default Relay.createContainer(
  ({relay, parent: {id, propositions: {pageInfo, edges}}, viewer, cardProps}) => (
    <InfiniteScroll
      hasMore={pageInfo.hasNextPage}
      loadMore={() => {
        !relay.pendingVariables && relay.setVariables({first: relay.variables.first + BATCH_SIZE})
      }}
      loader={<div style={{clear: 'both'}}>Loading ...</div>}>
      {edges.map(({node}) => (
        <PropositionCard key={node.id} {...cardProps} proposition={node} viewer={viewer}
                         withParent={relay.variables.withParent}/>
      ))}
    </InfiniteScroll>
  ),
  {

    initialVariables: {first: BATCH_SIZE, query: '', withParent: false},

    fragments: {

      parent: (vars) => Relay.QL`
        fragment on PropositionsParent {
          id
          propositions(first: $first, query: $query) {
            pageInfo {
              hasNextPage
            }
            edges {
              node {
                id
                ${PropositionCard.getFragment('proposition', {withParent: vars.withParent})}
              }
            }
          }
        }
      `,

      viewer: (vars) => Relay.QL`
        fragment on Viewer {
          ${PropositionCard.getFragment('viewer', {withParent: vars.withParent})}
        }
      `

    }

  }
);