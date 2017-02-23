import gql from 'graphql-tag';
import Link from 'next/link';
import React, {Component} from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import apollo from '../apollo'
import PropositionCard from '../components/proposition-card';
import {PageContainer} from '../components/ui';


const query = gql`
  query($id: ID!, $first: Int!) {
    viewer {
      is_god
      ...propositionCardViewer
    }
    node(id: $id) {
      ...proposition
    }
  }
  fragment proposition on Proposition {
    id
    ...propositionCardProposition
    children(first: $first) {
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
  }
  ${PropositionCard.fragments.proposition}
  ${PropositionCard.fragments.viewer}
`;

export default class PropositionPage extends Component {

  static async getInitialProps({query: {id}}) {
    return await apollo.query({
      query,
      variables: {
        id,
        first: 20
      }
    })
  }

  state = {
    showNewForm: false
  };

  toggleShowNewForm = () => {
    this.setState((state) => ({showNewForm: !state.showNewForm}));
  };

  loadMore = () => {
    const {relay} = this.props;
    relay.setVariables({first: relay.variables.first + 10})
  };

  render() {
    const {data: {node: proposition, viewer}} = this.props;
    const {id, children} = proposition;
    return (
      <PageContainer>

        <p style={{textAlign: 'center'}}><Link href="/"><a>Back to all</a></Link></p>

        <PropositionCard {...{proposition, viewer}} withParent/>

        {this.state.showNewForm
          ? <PropositionCard proposition={null} parentID={id} viewer={viewer}
                             onCancel={this.toggleShowNewForm}/>
          : viewer.is_god && (
            <p style={{textAlign: 'center'}}>
              <button type="button" onClick={this.toggleShowNewForm}>Add Proposition</button>
            </p>
          )
        }

        <InfiniteScroll
          hasMore={children.pageInfo.hasNextPage}
          loadMore={this.loadMore}
          loader={<div>Loading ...</div>}>
          {children.edges.map(({node}) => (
            <PropositionCard key={node.id} proposition={node} viewer={viewer} withStats/>
          ))}
        </InfiniteScroll>

      </PageContainer>
    );
  }

}


