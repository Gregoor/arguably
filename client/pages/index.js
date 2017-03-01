import React from 'react';
import DocumentTitle from 'react-document-title';
import Relay from 'react-relay';

import PropositionList from '../components/proposition-list';


export default Relay.createContainer(
  ({viewer, relay}) => (
    <DocumentTitle title="Arguably">
      <PropositionList parent={viewer} viewer={viewer}/>
    </DocumentTitle>
  ),
  {

    initialVariables: {first: 20},

    fragments: {viewer: () => Relay.QL`
      fragment on Viewer {
        ${PropositionList.getFragment('parent')}
        ${PropositionList.getFragment('viewer')}
      }
    `}

  }
);