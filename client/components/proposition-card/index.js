import React from 'react'
import Relay from 'react-relay'
import styled from 'styled-components'
import {Card, CardSection} from '../ui'
import Form from './form'
import View from './view'

const Separator = styled.hr`
  border-color: rgba(0,0,0,.05);
`

const Content = Relay.createContainer(
  class extends React.Component {

    state = {
      isEditing: false
    };

    toggleIsEditing = () => {
      this.setState((state) => ({isEditing: !state.isEditing}))
    };

    render() {
      const {relay, parentID, proposition, viewer, hideParent, showType} = this.props
      const {withParent} = relay.variables
      const {has_parent: hasParent, parent} = proposition || {}

      return (
        <div>
          {!hideParent && hasParent && [
            withParent
              ? <Content key="content" proposition={parent} viewer={viewer} withParent={false}/>
              : (
                <CardSection key="loader" style={{cursor: 'pointer'}}
                             onClick={() => relay.setVariables({withParent: true})}>
                  <b>...</b>
                </CardSection>
              ),
            <Separator key="separator"/>
          ]}
          {!proposition || this.state.isEditing
            ? <Form {...{proposition, viewer, parentID}} onCancel={this.toggleIsEditing}/>
            : <View {...{proposition, viewer}} showType={showType || withParent}
                    onEdit={this.toggleIsEditing}/>
          }
        </div>
      )
    }

},
  {

    initialVariables: {withParent: false},

    fragments: {

      proposition: (vars) => Relay.QL`
        fragment on Proposition {
          has_parent
          parent {
            ${Content.getFragment('proposition', {withParent: false}).if(vars.withParent)}
          }
          ${Form.getFragment('proposition')}
          ${View.getFragment('proposition')}
        }
      `,

      viewer: (vars) => Relay.QL`
        fragment on Viewer {
          ${Content.getFragment('viewer', {withParent: false}).if(vars.withParent)}
          ${Form.getFragment('viewer')}
          ${View.getFragment('viewer')}
        }
      `

    }

  }
)

export default Relay.createContainer((props) => <Card><Content {...props}/></Card>, {

  initialVariables: {withParent: false},

  fragments: {

    proposition: (vars) => Relay.QL`
      fragment on Proposition {
        ${Content.getFragment('proposition', vars)}
      }
    `,

    viewer: (vars) => Relay.QL`
      fragment on Viewer {
        ${Content.getFragment('viewer', vars)}
      }
    `

  }

})
