import React from 'react';
import DocumentTitle from 'react-document-title';
import Relay from 'react-relay';

import PropositionCard from '../components/proposition-card';
import PropositionList from '../components/proposition-list';
import Search from '../components/search';


export default Relay.createContainer(
  ({viewer, relay}) => (
    <DocumentTitle title="Arguably"><div>

      <Search onChange={({target}) => relay.setVariables({query: target.value})}/>

      {viewer.user && <PropositionCard proposition={null} viewer={viewer}/>}

      <PropositionList parent={viewer} viewer={viewer} query={relay.variables.query} withParent/>
    </div>
    </DocumentTitle>
  ),
  {

    initialVariables: {query: ''},

    fragments: {viewer: (vars) => Relay.QL`
      fragment on Viewer {
        user {
          id
        }
        ${PropositionCard.getFragment('viewer', {withParent: false})}
        ${PropositionList.getFragment('parent', {query: vars.query, withParent: true})}
        ${PropositionList.getFragment('viewer', {query: vars.query, withParent: true})}
      }
    `}

  }
);