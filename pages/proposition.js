import Link from 'next/link';
import React, {Component} from 'react';
import DocumentTitle from 'react-document-title';
import Relay from 'react-relay';
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
    const {proposition: {id, name, children, ...proposition}, viewer} = this.props;
    return (
      <DocumentTitle title={name + ' - Arguably'}><div>

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

      </div></DocumentTitle>
    );
  }

}

PropositionPage = Relay.createContainer(PropositionPage, {

  initialVariables: {first: 20},

  fragments: {

    proposition: () => Relay.QL`
      fragment on Proposition {
        id
        name
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
        is_god
        ${PropositionCard.getFragment('viewer')}
      }
    `

  }

});

export default () => RelayPage(
  Relay.createContainer(
    ({node, viewer}) => <PropositionPage proposition={node} viewer={viewer}/>,
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



