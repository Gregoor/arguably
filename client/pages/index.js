import React from 'react';
import DocumentTitle from 'react-document-title';
import Relay from 'react-relay';

import PropositionCard from '../components/proposition-card';
import PropositionList from '../components/proposition-list';


export default Relay.createContainer(
  ({viewer, relay}) => (
    <DocumentTitle title="Arguably"><div>

      {viewer.user && (
        <PropositionCard proposition={null} viewer={viewer}/>
      )}

      <PropositionList parent={viewer} viewer={viewer}/>

    </div></DocumentTitle>
  ),
  {

    initialVariables: {first: 20},

    fragments: {viewer: () => Relay.QL`
      fragment on Viewer {
        user {
          id
        }
        ${PropositionCard.getFragment('viewer')}
        ${PropositionList.getFragment('parent')}
        ${PropositionList.getFragment('viewer')}
      }
    `}

  }
);