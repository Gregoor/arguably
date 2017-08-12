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
      const {relay, parentID, proposition, viewer, hideParent, showType} = this.props
      const {withParent} = {} || relay.variables
      const {has_parent: hasParent, parent} = proposition || {}

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
          {!proposition || this.state.isEditing
            ? (
              <PropositionForm
                {...{proposition, viewer, parentID}}
                onCancel={this.toggleIsEditing}
              />
            ) : (
              <PropositionView
                {...{proposition, viewer}}
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
    proposition: graphql`
      fragment PropositionCard_proposition on Proposition {
#        has_parent
#        parent {
#          ...PropositionCard_proposition @include(if: $withParent)
#        }
        ...PropositionForm_proposition
        ...PropositionView_proposition
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
