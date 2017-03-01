import React, {Component} from 'react';
import DocumentTitle from 'react-document-title';
import Relay from 'react-relay';

import PropositionCard from '../components/proposition-card';
import PropositionList from '../components/proposition-list';


class PropositionPage extends Component {

  loadMore = () => {
    const {relay} = this.props;
    relay.setVariables({first: relay.variables.first + 10})
  };

  render() {
    const {proposition: {id, name, ...proposition}, viewer} = this.props;
    return (
      <DocumentTitle title={name + ' - Arguably'}><div>

        <PropositionCard {...{proposition, viewer}} withParent/>

        {viewer.user && viewer.user.can_publish && (
          <PropositionCard proposition={null} parentID={id} viewer={viewer}/>
        )}

        <PropositionList parent={proposition} viewer={viewer}/>

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
        ${PropositionList.getFragment('parent')}
      }
    `,

    viewer: () => Relay.QL`
      fragment on Viewer {
        user {
          can_publish
        }
        ${PropositionCard.getFragment('viewer')}
        ${PropositionList.getFragment('viewer')}
      }
    `

  }

});

export default Relay.createContainer(
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
);



