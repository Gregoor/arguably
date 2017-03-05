import React from 'react';
import Relay from 'react-relay';

import {TypeTag} from './components';
import Form from './form';
import {Card, CardSection, CardTitle, PropositionTitleLink} from '../ui';
import View from './view';


const ParentProposition = Relay.createContainer(
  ({proposition: {id, name, type, has_parent, parent}, relay}) => (
    <div>
      {has_parent && (
        relay.variables.withParent
          ? (
            <div>
              <ParentProposition proposition={parent}/>
              <CardSection>
                <TypeTag {...{type}}>{type}</TypeTag>
              </CardSection>
            </div>
          )
          : (
            <CardSection style={{cursor: 'pointer'}}
                         onClick={() => relay.setVariables({withParent: true})}>
              <b>...</b>
            </CardSection>
          )
      )}
      <CardTitle><PropositionTitleLink id={id} style={{opacity: .5}}>
        {name}
      </PropositionTitleLink></CardTitle>
    </div>
  ),
  {

    initialVariables: {withParent: false},

    fragments: {

      proposition: (vars) => Relay.QL`
        fragment on Proposition {
          id
          name
          type
          has_parent
          parent {
            ${ParentProposition.getFragment('proposition').if(vars.withParent)}
          }
        }
      `

    }

  }
);

export default Relay.createContainer(
  class extends React.Component {

    state = {
      isEditing: false
    };

    toggleIsEditing = () => {
      this.setState((state) => ({isEditing: !state.isEditing}));
    };

    render() {
      const {props, state} = this;
      const {proposition, relay: {variables: {withParent}}} = props;
      const {parent} = proposition || {};

      const Component = !proposition || state.isEditing ? Form : View;
      return (
        <Card>
          {withParent && parent && <ParentProposition proposition={parent}/>}
          <Component {...props} onEdit={this.toggleIsEditing} onCancel={this.toggleIsEditing}/>
        </Card>
      );
    }

  },
  {

    initialVariables: {withParent: false},

    fragments: {

      proposition: (vars) => Relay.QL`
        fragment on Proposition {
          parent {
            ${ParentProposition.getFragment('proposition').if(vars.withParent)}
          }
          ${Form.getFragment('proposition')}
          ${View.getFragment('proposition')}
        }
      `,

      viewer: () => Relay.QL`
        fragment on Viewer {
          ${Form.getFragment('viewer')}
          ${View.getFragment('viewer')}
        }
      `

    }

  }
);