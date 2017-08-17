import Head from 'next/head'
import React from 'react'
import {graphql} from 'react-relay'
import Layout from '../components/Layout'
import Page from '../components/Page'
import SearchablePropositionList from '../components/SearchablePropositionList'

// {viewer.user && <PropositionCard proposition={null} viewer={viewer}/>}
export default Page(
  ({viewer, relay, url}) => (
    <Layout viewer={viewer}>
      <Head><title>Arguably</title></Head>
      <SearchablePropositionList parent={viewer} viewer={viewer}/>
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
        ...SearchablePropositionList_parent
        ...SearchablePropositionList_viewer
      }
    }
  `,
  {count: 3, cursor: null, order: {by: 'CREATED_AT', desc: true}, query: ''}
)
