import Head from 'next/head'
import React from 'react'
import {graphql} from 'react-relay'
import Layout from '../components/Layout'
import PropositionList from '../components/PropositionList'
import Page from '../components/Page'
import Search from '../components/Search'

// {viewer.user && <PropositionCard proposition={null} viewer={viewer}/>}
export default Page(
  ({viewer, relay}) => (
    <Layout viewer={viewer}>
      <Head><title>Arguably</title></Head>

      <Search onChange={({target}) => relay.setVariables({query: target.value})}/>

      <PropositionList
        parent={viewer}
        viewer={viewer}
        query={''}// relay.variables.query}
        withParent
        cardProps={{showType: true}}
      />
    </Layout>
  ),
  graphql`
    query pages_indexQuery(
      $count: Int!
      $cursor: String
      $isGeneral: Boolean!
      $order: PropositionOrder!
    ) {
      viewer {
        ...Layout_viewer
        ...PropositionList_parent
        ...PropositionList_viewer
      }
    }
  `,
  {count: 3, cursor: null, order: {by: 'CREATED_AT', desc: true}}
)
