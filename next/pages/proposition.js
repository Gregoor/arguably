import Head from 'next/head'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import Layout from '../components/Layout'
import PropositionCard from '../components/PropositionCard/PropositionCard'
import PropositionList from '../components/PropositionList'
import Page from '../components/Page'

const PropositionPage = createFragmentContainer(
  ({propositionRelation: {proposition}, viewer}) => (
    <div>
      <Head><title>{proposition.name + ' - Arguably'}</title></Head>

      <PropositionCard {...{proposition, viewer}} withParent showType={true}/>

      {viewer.user && (
        <PropositionCard proposition={null} viewer={viewer} withParent/>
      )}

      <PropositionList
        parent={proposition}
        {...{viewer}}
        withParent={false}
        cardProps={{
          hideParent: true,
          showType: true
        }}
      />
    </div>
  ),
  {
    propositionRelation: graphql`
      fragment proposition_propositionRelation on PropositionRelation {
        proposition {
          name
        }
      }
    `,
    viewer: graphql`
      fragment proposition_viewer on Viewer {
        ...PropositionCard_viewer
        ...PropositionList_viewer
#        user {
#          canPublish
#        }
      }
    `
  }
)

export default Page(
  ({viewer, relay}) => (
    <Layout viewer={viewer}>
      <PropositionPage viewer={viewer}/>
    </Layout>
  ),
  graphql`
    query propositionQuery(
      $count: Int!
      $cursor: String
      $order: PropositionOrder!
    ) {
      node(id: $id) {
        ...PropositionPage_propositionRelation
      }
      viewer {
        ...Layout_viewer
        ...PropositionPage_viewer
      }
    }
  `,
  {count: 3, cursor: null, order: {by: 'VOTES', desc: true}}
)
