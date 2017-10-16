import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import styled, {css} from 'styled-components'
// import VoteMutation from '../../mutations/vote'
import {getTypeLabel} from '../../helpers'
import {CardSection, CardTitle, PropositionLink, PropositionTitleLink} from '../ui'
import {StatsBar, TypeTag} from './components'
import ArrowUpSVG from './ic_keyboard_arrow_up_black_24px.svg'
import CompareArrowsSVG from './ic_compare_arrows_black_24px.svg'
import ModeEditSVG from './ic_mode_edit_black_24px.svg'

const vote = (proposition) => null// Relay.Store.commitUpdate(new VoteMutation({proposition}))

const activeColor = 'black'
const inactiveColor = '#aab8c2'
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
`

const ImageLink = styled(PropositionLink)`
  ${imageContainerChunk}
`

const ImageButton = styled.button`
  background: none;
  border: none;
  ${imageContainerChunk}
`

const ImageWrapper = styled.span`
  width: 20px;
  margin-right: 4px;
`

const SourceSection = ({children}) => (
  <CardSection>
    <b style={{marginRight: 5}}>Source:</b>
    {children}
  </CardSection>
)

export default createFragmentContainer(
  ({
    propositionRelation: {
      id,
      childCount,
      type,
      proposition: {
        user: author,
        name,
        published,
        parent,
        sourceURL,
        text,
        votedByUser,
        votesCount,
        ...proposition
      }
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
      {sourceURL && <SourceSection><a href={sourceURL}>{sourceURL}</a></SourceSection>}

      <StatsBar>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <ImageButton
            id={id}
            title={votedByUser ? 'Undo vote' : 'Upvote'}
            style={{marginRight: 16}}
            onClick={() => vote(proposition)}
            active={votedByUser}
          >
            <ImageWrapper><ArrowUpSVG/></ImageWrapper>
            <span>{votesCount}</span>
          </ImageButton>
          <ImageLink id={id} title="Discuss">
            <span>
              <ImageWrapper><CompareArrowsSVG/></ImageWrapper>
              {childCount || ''}
            </span>
          </ImageLink>
        </div>
        {user && (user.canPublish || (!published && author.id)) && (
          <ImageButton id={id} title="Edit" type="button" onClick={onEdit}>
            <span style={{width: 15}}><ModeEditSVG/></span>
          </ImageButton>
        )}
      </StatsBar>

    </div>
  ),
  {
    propositionRelation: graphql`
      fragment PropositionView_propositionRelation on PropositionRelation {
        id
        type
        proposition {
          name
          published
          sourceURL
          text
        }
#        votes_count
#        voted_by_user
#        user {
#          id
#        }
        #VoteMutation.getFragment('proposition')
      }
    `,
    viewer: graphql`
      fragment PropositionView_viewer on Viewer {
        user {
          id
#          canVote
#          canPublish
        }
      }
    `
  }
)
