import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import styled from 'styled-components'
import {Card, CardSection} from '../ui'
import PropositionForm from './PropositionForm'
import PropositionView from './PropositionView'

const Separator = styled.hr`
  border-color: rgba(0,0,0,.05);
`

const PropositionCard = createFragmentContainer(
  class extends React.Component {

    state = {
      isEditing: false
    };

    toggleIsEditing = () => {
      this.setState((state) => ({isEditing: !state.isEditing}))
    };

    render() {
      const {relay, propositionRelation, viewer, hideParent, showType} = this.props
      const {withParent} = {} || relay.variables
      const {hasParent, parent} = propositionRelation || {}

      return (
        <Card>
          {!hideParent && hasParent && [
            withParent
              ? (
                <PropositionCard
                  key="content"
                  proposition={parent}
                  viewer={viewer}
                  withParent={false}
                />
              ) : (
                <CardSection
                  key="loader"
                  style={{cursor: 'pointer'}}
                  onClick={() => relay.setVariables({withParent: true})}
                >
                  <b>...</b>
                </CardSection>
              ),
            <Separator key="separator"/>
          ]}
          {!propositionRelation || this.state.isEditing
            ? (
              <PropositionForm
                {...{propositionRelation, viewer}}
                onCancel={this.toggleIsEditing}
              />
            ) : (
              <PropositionView
                {...{propositionRelation, viewer}}
                showType={showType || withParent}
                onEdit={this.toggleIsEditing}
              />
            )
          }
        </Card>
      )
    }

  },
  {
    propositionRelation: graphql`
      fragment PropositionCard_propositionRelation on PropositionRelation {
#        has_parent
#        parent {
#          ...PropositionCard_proposition @include(if: $withParent)
#        }
        ...PropositionForm_propositionRelation
        ...PropositionView_propositionRelation
      }
    `,
    viewer: graphql`
      fragment PropositionCard_viewer on Viewer {
#        ...PropositionCard_viewer @include(if: $withParent)
        ...PropositionForm_viewer
        ...PropositionView_viewer
      }
    `

  }
)

export default PropositionCard
