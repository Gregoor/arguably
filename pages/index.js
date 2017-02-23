import gql from 'graphql-tag';
import React, {Component} from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import apollo from '../apollo'
import PropositionCard from '../components/proposition-card/index';
import {PageContainer} from '../components/ui';


const query = gql`
query($first: Int!) {
  viewer {
    root_propositions(first: $first) {
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          id
          ...propositionCardProposition
        }
      }
    }
    ...propositionCardViewer
  }
}
${PropositionCard.fragments.proposition}
${PropositionCard.fragments.viewer}
`;


export default class extends Component {

  static async getInitialProps() {
    return await apollo.query({
      query,
      variables: {
        first: 20
      }
    })
  }

  render() {
    const {data: {viewer}} = this.props;
    const {root_propositions: {pageInfo, edges}} = viewer;
    return (
      <PageContainer>
        <InfiniteScroll
          hasMore={pageInfo.hasNextPage}
          loadMore={() => true || relay.setVariables({first: relay.variables.first + 10})}
          loader={<div>Loading ...</div>}>
          {edges.map(({node}) => (
            <PropositionCard key={node.id} proposition={node} viewer={viewer} withStats/>
          ))}
        </InfiniteScroll>
      </PageContainer>
    );
  }

};