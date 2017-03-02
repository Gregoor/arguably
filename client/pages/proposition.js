import React from 'react';
import DocumentTitle from 'react-document-title';
import Relay from 'react-relay';

import PropositionCard from '../components/proposition-card';
import PropositionList from '../components/proposition-list';


const PropositionPage = Relay.createContainer(
  ({proposition: {id, name, ...proposition}, viewer}) => (
    <DocumentTitle title={name + ' - Arguably'}><div>

      <PropositionCard {...{proposition, viewer}} withParent/>

      {viewer.user && (
        <PropositionCard proposition={null} parentID={id} viewer={viewer}/>
      )}

      <PropositionList parent={proposition} viewer={viewer}/>

    </div></DocumentTitle>
  ),
  {

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

  }
);

export default Relay.createContainer(
  ({node, viewer}) => {
    if (!node) {
      return <div>Not found!</div>
    }
    return <PropositionPage proposition={node} viewer={viewer}/>;
  },
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



