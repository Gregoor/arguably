import React from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import {createPaginationContainer, graphql} from 'react-relay'
import PropositionCard from './PropositionCard/PropositionCard'

const BATCH_SIZE = 3

export default createPaginationContainer(
  ({relay, parent: {children: {pageInfo, edges}}, viewer, cardProps}) => (
    <InfiniteScroll
      hasMore={pageInfo.hasNextPage}
      loadMore={() => relay.hasMore() && relay.loadMore(BATCH_SIZE)}
      loader={<div style={{clear: 'both'}}>Loading ...</div>}
    >
      {edges.map(({node}) => (
        <PropositionCard
          key={node.id}
          {...cardProps}
          propositionRelation={node}
          viewer={viewer}
          withParent={false/* relay.variables.withParent */}
        />
      ))}
    </InfiniteScroll>
  ),
  {
    parent: graphql.experimental`
      fragment PropositionList_parent on Viewer {
        children(
          after: $cursor
          first: $count
          order: $order
          query: $query
        ) @connection(key: "PropositionList_children") {
          edges {
            node {
              id
              ...PropositionCard_propositionRelation 
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    `,
    viewer: graphql`
      fragment PropositionList_viewer on Viewer {
        ...PropositionCard_viewer
      }
    `
  },
  {
    direction: 'forward',
    getConnectionFromProps({parent}) {
      return parent && parent.children
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount
      }
    },
    getVariables(props, {cursor}, fragmentVariables) {
      return {
        count: BATCH_SIZE,
        cursor,
        order: fragmentVariables.order
      }
    },
    query: graphql`
      query PropositionListPaginationQuery(
        $count: Int!
        $cursor: String
        $order: PropositionOrder!
        $query: String
      ) {
        viewer {
          ...PropositionList_parent
        }
      }
    `
  }
)