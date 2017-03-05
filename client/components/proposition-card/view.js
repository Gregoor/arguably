import React from 'react';
import Relay from 'react-relay';
import styled from 'styled-components';

import {StatsBar, TypeTag} from './components';
import {getTypeLabel} from '../../helpers';
import {CardSection, CardTitle, PropositionLink, PropositionTitleLink} from '../ui';

import compareArrows from './ic_compare_arrows_black_24px.svg';
import modeEdit from './ic_mode_edit_black_24px.svg';


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
    proposition: {
      user: author, id, name, propositions_count, published, parent, source_url, text, type
    },
    viewer: {user},
    onEdit,
    showType
  }) => (
    <div>
      {!published && (
        <CardSection style={{color: '#FFC107'}}>
          This proposition still needs to be verified by admins before it will be published.
        </CardSection>
      )}

      {showType && type && (
        <CardSection>
          <TypeTag {...{type}}>{getTypeLabel(type)}</TypeTag>
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

    </div>
  ),
  {

    fragments: {

      proposition: () => Relay.QL`
        fragment on Proposition {
          id
          name
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