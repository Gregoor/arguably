import React, {Component} from 'react';
import Relay from 'react-relay';
import Link from 'next/link';
import InfiniteScroll from 'react-infinite-scroller';

import PropositionCard from '../components/proposition-card';
import RelayPage from '../components/relay-page';


class PropositionPage extends Component {

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
    const {proposition: {id, children, ...proposition}, viewer} = this.props;
    return (
      <div>

        <p style={{textAlign: 'center'}}><Link href="/"><a>Back to all</a></Link></p>

        <PropositionCard {...{proposition}} withParent/>

        {this.state.showNewForm
          ? <PropositionCard proposition={null} parentID={id} viewer={viewer}
                             onCancel={this.toggleShowNewForm}/>
          : (
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

      </div>
    );
  }

}

PropositionPage = Relay.createContainer(PropositionPage, {

  initialVariables: {first: 20},

  fragments: {

    proposition: () => Relay.QL`
      fragment on Proposition {
        id
        ${PropositionCard.getFragment('proposition')}
        children(first: $first) {
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              id
              ${PropositionCard.getFragment('proposition', {withStats: true})}
            }
          }
        }
      }
    `,

    viewer: () => Relay.QL`
      fragment on Viewer {
        ${PropositionCard.getFragment('viewer')}
      }
    `

  }

});

export default () => RelayPage(
  Relay.createContainer(
    ({node}) => <PropositionPage proposition={node}/>,
    {
      fragments: {

        node: () => Relay.QL`
          fragment on Node {
            ${PropositionPage.getFragment('proposition')}
          }
        `,

        viewer: () => Relay.QL`
          fragment on Viewer {
            ${PropositionPage.getFragment('viewer')}
          }
        `

      }
    }
  ),
  ['node', 'viewer']
);



