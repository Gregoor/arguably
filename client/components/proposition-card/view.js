import React from 'react';
import Relay from 'react-relay';
import styled, {css} from 'styled-components';

import VoteMutation from '../../mutations/vote';

import {StatsBar, TypeTag} from './components';
import {getTypeLabel} from '../../helpers';
import {CardSection, CardTitle, PropositionLink, PropositionTitleLink} from '../ui';

import arrowUp from './ic_keyboard_arrow_up_black_24px.svg';
import compareArrows from './ic_compare_arrows_black_24px.svg';
import modeEdit from './ic_mode_edit_black_24px.svg';


const vote = (proposition) => Relay.Store.commitUpdate(new VoteMutation({proposition}));

const activeColor = 'black';
const inactiveColor = '#aab8c2';
const imageContainerChunk = css`
  display: flex;
  align-items: center;
  color: ${(props) => props.active ? activeColor : inactiveColor} !important;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
  outline: none;
  
  svg {
    fill: ${(props) => props.active ? activeColor : inactiveColor};
  }
  
  &:hover {
    color: ${(props) => props.active ? inactiveColor : activeColor} !important;
    
    svg {
      fill: ${(props) => props.active ? inactiveColor : activeColor};  
    }
  }
`;

const ImageLink = styled(PropositionLink)`
  ${imageContainerChunk}
`;

const ImageButton = styled.button`
  background: none;
  border: none;
  ${imageContainerChunk}
`;

const ImageWrapper = styled.span`
  width: 20px;
  margin-right: 4px;
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
      user: author,
      id,
      name,
      propositions_count,
      published,
      parent,
      source_url,
      text,
      type,
      voted_by_user,
      votes_count,
      ...proposition
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
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <ImageButton id={id} title="Upvote" style={{marginRight: 16}}
                       onClick={() => vote(proposition)} active={voted_by_user}>
            <ImageWrapper dangerouslySetInnerHTML={{__html: arrowUp}}/>
            <span>{votes_count}</span>
          </ImageButton>
          <ImageLink id={id} title="Discuss">
            <ImageWrapper dangerouslySetInnerHTML={{__html: compareArrows}}/>
            {propositions_count || ''}
          </ImageLink>
        </div>
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
          votes_count
          voted_by_user
          user {
            id
          }
          ${VoteMutation.getFragment('proposition')}
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