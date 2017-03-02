import React from 'react';
import Relay from 'react-relay';

import {Card, CardSection, CardTitle} from '../ui';
import {PropositionLink, StatsBar, SourceSection, TypeTag} from './components';


export default Relay.createContainer(
  ({
    onEdit,
    proposition: {
      user: author, id, name, propositions_count, published, parent, source_url, text, type
    },
    viewer: {user},
    withParent
  }) => (
    <Card>
      {!published && (
        <CardSection style={{color: '#FFC107'}}>
          This proposition still needs to be verified by admins before it will be published.
        </CardSection>
      )}

      {withParent && parent && (
        <CardTitle><PropositionLink id={parent.id} style={{opacity: .5}}>
          {parent.name}
        </PropositionLink></CardTitle>
      )}

      {type && (
        <CardSection>
          <TypeTag {...{type}}>{type}</TypeTag>
        </CardSection>
      )}

      <CardTitle>
        <PropositionLink id={id}>{name}</PropositionLink>
      </CardTitle>

      {text && <CardSection>{text}</CardSection>}
      {source_url && <SourceSection><a href={source_url}>{source_url}</a></SourceSection>}

      <StatsBar>
        <div>
          <b>Arguments:</b> {propositions_count}
        </div>
        {user && (user.can_publish || (!published && author.id)) && (
          <button type="button" onClick={onEdit}>
            Edit
          </button>
        )}
      </StatsBar>

    </Card>
  ),
  {

    fragments: {

      proposition: () => Relay.QL`
        fragment on Proposition {
          id
          name
          parent {
            id
            name
          }
          propositions_count
          published
          source_url
          text
          type
          user {
            id
          }
        }
      `,

      viewer: () => Relay.QL`
        fragment on Viewer {
          user {
            can_vote
            can_publish
          }
        }
      `

    }

  }
);