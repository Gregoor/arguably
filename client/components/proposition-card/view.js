import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import styled from 'styled-components';

import {Card, CardSection, CardTitle} from '../ui';
import {StatsBar, TypeTag} from './components';

import compareArrows from './ic_compare_arrows_black_24px.svg';
import modeEdit from './ic_mode_edit_black_24px.svg';


const PropositionLink = ({children, id, ...props}) => (
  <Link to={`/proposition/${id}`} {...props}>
    {children}
  </Link>
);

const PropositionTitleLink = styled(PropositionLink)`
  color: black !important;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const ImageLink = styled(PropositionLink)`
  display: flex;
  align-items: center;
  color: #aab8c2 !important;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
  
  svg {
    fill: #aab8c2;  
  }
  
  &:focus, &:hover {
    color: black !important;
    
    svg {
      fill: black;  
    }
  }
`;

const ImageButton = styled.button`
  display: flex;
  background: none;
  border: none;
  cursor: pointer;
  
  svg {
    fill: #aab8c2;  
  }
  
  &:focus, &:hover {
    svg {
      fill: black;  
    }
  }
`;

const SourceSection = ({children}) => (
  <CardSection>
    <b style={{marginRight: 5}}>Source:</b>
    {children}
  </CardSection>
);

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
        <CardTitle><PropositionTitleLink id={parent.id} style={{opacity: .5}}>
          {parent.name}
        </PropositionTitleLink></CardTitle>
      )}

      {type && (
        <CardSection>
          <TypeTag {...{type}}>{type}</TypeTag>
        </CardSection>
      )}

      <CardTitle>
        <PropositionTitleLink id={id}>{name}</PropositionTitleLink>
      </CardTitle>

      {text && <CardSection>{text}</CardSection>}
      {source_url && <SourceSection><a href={source_url}>{source_url}</a></SourceSection>}

      <StatsBar>
        <ImageLink id={id} title="Discuss">
          <span style={{width: 20, marginRight: 4}} dangerouslySetInnerHTML={{__html: compareArrows}}/>
          {propositions_count || ''}
        </ImageLink>
        {user && (user.can_publish || (!published && author.id)) && (
          <ImageButton id={id} title="Edit" type="button" onClick={onEdit}>
            <span style={{width: 15}} dangerouslySetInnerHTML={{__html: modeEdit}}/>
          </ImageButton>
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