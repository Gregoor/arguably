import React from 'react'
import {createRefetchContainer, graphql} from 'react-relay'
import PropositionList from '../components/PropositionList'
import Search from '../components/Search'

export default createRefetchContainer(
  (props) => (
    <div>
      <Search/>
      <PropositionList {...props} query={''} withParent cardProps={{showType: true}}/>
    </div>
  ),
  {
    parent: graphql.experimental`
      fragment SearchablePropositionList_parent on PropositionRelationsParent
      @argumentDefinitions(
        query: {type: "String", defaultValue: ""}
      ) {
        ...PropositionList_parent
      }
    `,
    viewer: graphql.experimental`
      fragment SearchablePropositionList_viewer on Viewer {
        ...PropositionList_viewer
      }
    `
  },
  graphql.experimental`
    query SearchablePropositionListRefetchQuery($query: String) {
      viewer {
        ...SearchablePropositionList_parent @arguments(query: $query)
      }
    }
  `
)
