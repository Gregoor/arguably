import React from 'react'
import {graphql} from 'react-relay'
import Layout from '../Layout'
import PropositionList from '../PropositionList'
import Page from './BasePage'

// {viewer.user && <PropositionCard proposition={null} viewer={viewer}/>}
export default Page(
  ({viewer, relay, url}) => (
    <Layout viewer={viewer}>
      <PropositionList parent={viewer} viewer={viewer}/>
    </Layout>
  ),
  graphql`
    query pages_indexQuery(
      $count: Int!
      $cursor: String
      $order: PropositionOrder!
      $query: String
    ) {
      viewer {
        ...Layout_viewer
        ...PropositionList_parent
        ...PropositionList_viewer
      }
    }
  `,
  {count: 3, cursor: null, order: {by: 'CREATED_AT', desc: true}, query: ''}
)
