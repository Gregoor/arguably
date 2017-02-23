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

const PageContent = ({onLoadMore, viewer}) => {
  const {root_propositions: {pageInfo, edges}} = viewer;
  return (
    <PageContainer>
      <InfiniteScroll
        hasMore={pageInfo.hasNextPage}
        loadMore={onLoadMore}
        loader={<div>Loading ...</div>}>
        {edges.map(({node}) => (
          <PropositionCard key={node.id} proposition={node} viewer={viewer} withStats/>
        ))}
      </InfiniteScroll>
    </PageContainer>
  );
};

const INITIAL_FIRST = 20;

export default class IndexPage extends Component {

  static async getInitialProps() {
    return await apollo.query({
      query,
      variables: {
        first: INITIAL_FIRST
      }
    })
  }

  state = {data: null, first: INITIAL_FIRST};

  loadMore = async() => {
    const first = this.state.first + INITIAL_FIRST;

    this.setState({
      first,
      ...await apollo.query({query, variables: {first}})
    });
  };

  render() {
    console.log(this.state.data)
    return <PageContent {...this.props.data} {...this.state.data} onLoadMore={this.loadMore} />
  }

};